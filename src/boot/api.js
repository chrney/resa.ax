import { boot } from "quasar/wrappers";
import axios from "axios";
import { all_stations, plan_transit_walk } from "boot/queries";
import moment from "moment";
import { get_mode_class } from "boot/generic";

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
        let data = response.data.data.plan;
        if (data && data.itineraries) {
          const new_trips = data.itineraries.map((item) =>
            extend_trip(item, point)
          );
          found_trips = [...found_trips, ...new_trips];
        }
        let next_page_found = false;
        if (data.nextPageCursor && !plan_params.arriveBy) {
          plan_params.pageCursor = data.nextPageCursor;
          next_page_found = true;
        }
        if (data.previousPageCursor && plan_params.arriveBy) {
          params.pageCursor = data.previousPageCursor;
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
  item.unique_id =
    "id_" + (Date.now().toString(36) + Math.random().toString(36).substr(2));
  item.duration = moment.duration(moment(item.endTime).diff(item.startTime));
  item.search = point.value;

  let duration_str = [];
  if (item.duration.hours() > 0) {
    duration_str.push(item.duration.hours());
    duration_str.push("tim");
  }

  if (item.duration.minutes() > 0) {
    duration_str.push(item.duration.minutes());
    duration_str.push("min");
  }

  item.duration = duration_str.join(" ");

  item.from = item.legs[0].from;
  item.to = item.legs[item.legs.length - 1].to;

  item.graph = [];
  let total_length =
    item.legs[item.legs.length - 1].endTime - item.legs[0].startTime;

  item.legs.forEach((leg, idx) => {
    let newItem = {
      type: "leg",
      secs: leg.endTime - leg.startTime,
    };
    newItem.secFormated = moment.utc(newItem.secs).format("HH:mm");
    if (leg.mode === "WALK") {
      newItem.secFormated = parseInt(newItem.secs / 60 / 1000);
    }

    if (leg.from.name === "Origin") {
      leg.from.name = point.value.from.name;
    }

    if (leg.to.name === "Destination") {
      leg.to.name = point.value.to.name;
    }
    newItem.percentage = (newItem.secs / total_length) * 100;

    ["to", "from"].forEach((part) => {
      if (leg[part].stop && leg[part].stop.gtfsId) {
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
      pause.secFormated = parseInt(pause.secs / 60 / 1000);

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

const get_stops = () => {
  return api
    .post("index/graphql", {
      query: all_stations,
    })
    .then((response) => {
      let favorites = [
        "AX:9021302000118000",
        "AX:9021302000289000",
        "AX:9021302000308000",
        "AX:9021302000429000",
        "AX:9021302000075000",
        "AX:9021302001004000",
        "AX:9021302000178000",
        "AX:9021302001023000",
      ];
      return response.data.data.stations
        .map((station) => {
          station.favorite = favorites.includes(station.gtfsId);
          return station;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    });
};
export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api, find_trips, get_stops };