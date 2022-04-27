<template>
  <dropdown-picker
    :data="allStops"
    :label="$t('search.label_from')"
    direction="from"
    icon="start"
    @stopChosen="stopChosenFn"
  />
  <dropdown-picker
    :data="allStops"
    :label="$t('search.label_to')"
    direction="to"
    icon="start"
    @stopChosen="stopChosenFn"
  />

  <q-btn-toggle
    v-model="mode"
    :options="[
      { label: $t('search.btn_now'), value: 'now' },
      { label: $t('search.btn_departure'), value: 'departure' },
      { label: $t('search.btn_arrival'), value: 'arrival' },
    ]"
    class="q-mb-md"
    color="white"
    dense
    no-caps
    spread
    text-color="black"
    toggle-color="primary"
  />

  <div
    v-if="mode === 'arrival' || mode === 'departure'"
    class="row q-col-gutter-md"
  >
    <q-input
      v-model="dateModel"
      bg-color="white"
      class="q-mb-md col-6"
      dense
      filled
    >
      <template v-slot:prepend>
        <q-icon class="cursor-pointer" name="event">
          <q-popup-proxy
            ref="qDateProxy"
            cover
            transition-hide="scale"
            transition-show="scale"
          >
            <q-date v-model="dateModel" mask="YYYY-MM-DD" no-unset today-btn>
              <div class="row items-center justify-end">
                <q-btn
                  v-close-popup
                  :label="$t('search.btn_close_calendar')"
                  color="primary"
                  flat
                />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input
      v-model="timeModel"
      :rules="['time']"
      bg-color="white"
      class="q-mb-md col-6"
      dense
      filled
      mask="time"
    >
      <template v-slot:prepend>
        <q-icon name="schedule" />
      </template>
    </q-input>
  </div>

  <q-btn
    :disable="!(point.to && point.to.gtfsId && point.from && point.from.gtfsId)"
    :label="$t('search.btn_search')"
    class="full-width"
    color="primary"
    icon="search"
    size="xl"
    stretch
    @click="searchFn()"
  />
  <span class="text-grey-5">
    <!--{{ $q.screen.width }} x {{ $q.screen.height }} | {{ $q.screen.name }}-->
  </span>
</template>

<script>
import { defineComponent, ref } from "vue";
import { formatTS, get_mode_class, scroll_to_results } from "boot/generic";
import { api } from "boot/axios";
import moment from "moment";
import DropdownPicker from "components/DropdownPicker";
import { all_stations, plan_transit_walk } from "boot/queries";

export default defineComponent({
  name: "SearchForm",
  components: { DropdownPicker },
  emits: ["foundTrips", "searchState", "searchDate"],

  setup: (_, { emit }) => {
    const point = ref({});
    const allStops = ref([]);
    const mode = ref("now");
    const dateModel = ref(formatTS(Date.now(), "YYYY-MM-DD"));
    const timeModel = ref(formatTS(Date.now(), "HH:mm"));

    const stopChosenFn = (data) => {
      point.value[data.direction] = data.stop;
    };

    api
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
        allStops.value = response.data.data.stations
          .map((station) => {
            station.favorite = favorites.includes(station.gtfsId);
            return station;
          })
          .sort((a, b) => a.name.localeCompare(b.name));
      });

    const extend_trip = (item) => {
      const now = moment(new Date());

      item.diff = moment.duration(moment(item.startTime).diff(now));

      item.unique_id =
        "id_" +
        (Date.now().toString(36) + Math.random().toString(36).substr(2));

      item.duration = moment.duration(
        moment(item.endTime).diff(item.startTime)
      );

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

        newItem.percentage = (newItem.secs / total_length) * 100;

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

    const find_trips = async () => {
      let found_trips = [];
      let is_done = false;
      let try_counter = 0;

      const plan_params = {
        fromPlace: point.value.from.gtfsId,
        toPlace: point.value.to.gtfsId,
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
                extend_trip(item)
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

    const searchFn = () => {
      emit("searchState", "loading");
      scroll_to_results();
      find_trips().then((data) => {
        emit("searchState", "done");
        emit("foundTrips", data);
        scroll_to_results();
      });
    };

    return {
      allStops,
      searchFn,
      stopChosenFn,
      point,
      mode,
      dateModel,
      timeModel,
    };
  },
});
</script>
