import { boot } from "quasar/wrappers";
import axios from "axios";
import { all_stations, plan_transit_walk } from "boot/queries";
import moment from "moment";
import { get_mode_class } from "boot/generic";
import ports from "assets/ports";
import favorites from "assets/favorites";

const key_exists = (target, s) => {
  s = s.split(".");
  let obj = target[s.shift()];
  while (obj && s.length) {
    obj = obj[s.shift()];
  }
  return obj;
};

const api = axios.create({
  baseURL: "https://otp.alandstrafiken.ax/otp/routers/default/",
});

const find_trips = async (point, mode, dateModel, timeModel) => {
  let found_trips = [];
  let is_done = false;
  let try_counter = 0;

  const plan_params = {
    fromPlace: [point.value.from.lat, point.value.from.lon].join(","),
    toPlace: [point.value.to.lat, point.value.to.lon].join(","),
    date: "",
    time: "",
    arriveBy: false,
    locale: "sv",
    pageCursor: "",
  };
  if (mode.value !== "now") {
    plan_params.date = dateModel.value;
    plan_params.time = timeModel.value;
    plan_params.arriveBy = mode.value === "arrival";
  }

  while (!is_done) {
    await api
      .post("index/graphql", {
        query: plan_transit_walk,
        variables: plan_params,
      })
      .then((response) => {
        ["bike", "car", "transit"].forEach((type) => {
          let data = response.data.data[type];
          if (data && data.itineraries) {
            const new_trips = data.itineraries
              .filter((item) => {
                /* remove cars with only one leg */
                const car_only = type === "car" && item.legs.length === 1;
                const previously_added = found_trips.find(
                  (trip) =>
                    trip.duration === item.duration &&
                    trip.startTime === item.startTime
                );

                return !car_only && !previously_added;
              })
              .map((item) => {
                item = extend_trip(item, point);
                item.type = type;
                return item;
              });
            found_trips = [...found_trips, ...new_trips];
          }
        });
        let data = response.data.data.transit;

        let next_page_found = false;
        if (data.nextPageCursor && !plan_params.arriveBy) {
          plan_params.pageCursor = data.nextPageCursor;
          next_page_found = true;
        }
        if (data.previousPageCursor && plan_params.arriveBy) {
          plan_params.pageCursor = data.previousPageCursor;
          next_page_found = true;
        }
        try_counter++;
        is_done =
          found_trips.length >= 8 || try_counter >= 10 || !next_page_found;
      });
  }

  return {
    found_trips,
    search_date: dateModel.value,
  };
};

const extend_trip = (item, point) => {
  const now = moment(new Date());

  item.diff = moment.duration(moment(item.startTime).diff(now));
  item.days_absolute = moment(item.startTime).diff(now, "days");

  item.unique_id =
    "id_" + (Date.now().toString(36) + Math.random().toString(36).substr(2));
  item.durationObj = moment.duration(moment(item.endTime).diff(item.startTime));
  item.search = point.value;

  item.from = item.legs[0].from;
  item.to = item.legs[item.legs.length - 1].to;

  item.graph = [];
  let total_length =
    item.legs[item.legs.length - 1].endTime - item.legs[0].startTime;

  let first_public_leg = null;
  item.legs.forEach((leg, idx) => {
    let newItem = {
      type: "leg",
      secs: leg.endTime - leg.startTime,
    };
    newItem.secFormated = moment.utc(newItem.secs).format("HH:mm");
    if (leg.mode === "WALK") {
      newItem.secFormated = parseInt("" + newItem.secs / 60 / 1000);

      leg.walkToOppositeBusStop =
        key_exists(leg, "from.stop.parentStation.gtfsId") &&
        key_exists(leg, "to.stop.parentStation.gtfsId") &&
        leg.from.stop.parentStation.gtfsId === leg.to.stop.parentStation.gtfsId;
    }

    if (leg.from.name === "Origin") {
      leg.from.name = point.value.from.formatted;
    }

    if (!first_public_leg && ["BUS", "FERRY"].includes(leg.mode)) {
      first_public_leg = leg;
      item.first_public_leg = leg;
    }

    if (leg.to.name === "Destination") {
      leg.to.name = point.value.to.formatted;
    }
    newItem.percentage = (newItem.secs / total_length) * 100;

    ["to", "from"].forEach((part) => {
      if (key_exists(leg, part + ".stop.gtfsId")) {
        leg[part].busStopNumber = leg[part].stop.gtfsId.slice(-1);
      } else {
        leg[part].busStopNumber = "";
      }
    });

    leg = {
      ...leg,
      ...newItem,
    };

    item.graph.push(leg);

    if (idx + 1 !== item.legs.length) {
      let pause = {
        type: "pause",
        secs: item.legs[idx + 1].startTime - leg.endTime,
      };
      pause.secFormated = parseInt("" + pause.secs / 60 / 1000);

      pause.percentage = (pause.secs * 100) / total_length;

      item.graph.push(pause);
    }
  });

  let widths = item.graph
    .map((leg) => leg.percentage)
    .reduce((sum, x) => sum + x);
  item.graph = item.graph.map((leg) => {
    leg.percentage = (leg.percentage / widths) * 100;
    leg.color = get_mode_class(leg).join(" ");
    return leg;
  });
  return item;
};

const get_stops = async () => {
  return await api
    .post("index/graphql", {
      query: all_stations,
    })
    .then((response) => {
      return response.data.data.stations
        .map((station) => {
          station.favorite = favorites.includes(station.gtfsId);
          station.icon = ports.includes(station.gtfsId)
            ? "directions_boat"
            : "directions_bus";
          station.icon_color = "primary";
          return { ...station };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    });
};

const geo_lookup = async (str) => {
  let results = [];
  str = str[0].toUpperCase() + str.slice(1);
  await axios
    // .get("https://api.geoapify.com/v1/geocode/search", {
    .get("https://otp.alandstrafiken.ax/pelias/v1/autocomplete", {
      params: {
        text: str.trim(),
        boundary: { country: "AX" },
        sources: "osm,oa,gn,wof",
        layers: "venue,street,locality,address",
        size: 25,
      },
    })
    .then(function (response) {
      results = response.data.features

        .map((item) => {
          item.properties.favorite = false;
          switch (item.properties.layer) {
            case "venue":
              item.properties.formatted = [
                item.properties.name,
                item.properties.street,
                item.properties.housenumber,
                item.properties.locality,
              ];
              item.properties.icon = "house";
              break;
            case "address":
              item.properties.formatted = [
                item.properties.street,
                item.properties.housenumber,
                item.properties.locality,
              ];
              item.properties.icon = "map";
              break;

            case "locality":
              item.properties.formatted = [item.properties.name];
              item.properties.icon = "signpost";
              break;

            default:
              item.properties.formatted = [item.properties.name];
              item.properties.icon = "place";
          }
          item.properties.icon_color = "primary";

          item.properties.formatted = item.properties.formatted
            .join(" ")
            .trim()
            .replace(", Finland", "")
            .replace("Maarianhamina", "Mariehamn")
            .replace(", Åland", "")
            .replace("  ", " ")
            .trim();

          item.properties.lat = item.geometry.coordinates[1];
          item.properties.lon = item.geometry.coordinates[0];

          return item.properties;
        })
        .filter((item) => !item.formatted.includes("Ålandstrafiken Stop"));
    });
  return results.filter(
    (tag, index, array) =>
      array.findIndex((t) => t.formatted == tag.formatted) == index
  );
};

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api, find_trips, get_stops, geo_lookup };
