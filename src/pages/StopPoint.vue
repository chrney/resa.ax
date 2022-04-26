<template>
  <div v-if="stop" class="q-pa-md row q-col-gutter-md">
    <div class="col-12">
      <div class="text-h6">{{ stop.name }}</div>
      <q-date
        v-model="dateModel"
        mask="YYYY-MM-DD"
        @update:model-value="changeDateFn"
      />
      <div v-if="schedules.length === 0">Inga tidtabeller hittades</div>
      <template v-if="schedules.length > 0">
        <div v-for="(schedule, s_key) in schedules" v-bind:key="s_key">
          <ul>
            <li>
              Linje
              <q-icon
                :name="$mode_to_icon(routes[schedule.pattern.routeId].mode)"
              />
              <q-chip>{{ routes[schedule.pattern.routeId].shortName }}</q-chip>
              <strong>{{ routes[schedule.pattern.routeId].longName }}</strong> |
              <a
                class="cursor-pointer"
                @click="getPatternFn(schedule.pattern.id)"
                >Visa färdplan</a
              >
            </li>
            <li v-for="(t, t_idx) in schedule.times" v-bind:key="t_idx">
              <q-icon name="schedule" />
              {{
                $moment(
                  t.serviceDay * 1000 + t.scheduledDeparture * 1000
                ).format("HH:mm")
              }}
              mot <strong>{{ t.headsign }}</strong>
            </li>
          </ul>
        </div>
      </template>
    </div>

    <q-dialog v-model="showDialog">
      <q-card class="q-pa-lg q-ma-lg" style="width: 450px">
        <q-timeline color="secondary" layout="loose">
          <q-timeline-entry
            v-for="(item, idx) in stopPointsOnPattern.stops"
            v-bind:key="idx"
            :side="idx % 2 === 0 ? 'left' : 'right'"
            :title="item.name"
          >
          </q-timeline-entry>
        </q-timeline>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { api } from "boot/axios";

import { useRoute } from "vue-router";
import { formatTS } from "boot/generic";

export default defineComponent({
  components: {},

  name: "StopPointPage",

  setup: function () {
    const route = useRoute();
    const id = route.params.stopId;
    const today = formatTS(Date.now(), "YYYY-MM-DD");
    const dateModel = ref(today);

    const stop = ref();
    api.get("index/stops/" + id).then((response) => {
      stop.value = response.data;
    });

    const schedules = ref([]);

    const routes = ref([]);
    api.get("index/routes").then((routeResponse) => {
      let routeList = {};
      routeResponse.data.forEach((route) => {
        routeList[route.id] = route;
      });
      routes.value = routeList;
    });

    const get_schedules = (dateStr) => {
      api
        .get("index/stops/" + id + "/stoptimes/" + dateStr)
        .then((response) => {
          return response.data.filter((item) => item.times.length > 0);
        })
        .then((scheduleData) => {
          scheduleData = scheduleData
            .map((schedule) => {
              schedule.firstDeparture = schedule.times[0].scheduledDeparture;
              return schedule;
            })
            .sort(function (a, b) {
              return a.firstDeparture - b.firstDeparture;
            });
          schedules.value = scheduleData;
        });
    };

    get_schedules(today);

    const changeDateFn = (value) => {
      get_schedules(value);
    };

    const stopPointsOnPattern = ref([]);
    const showDialog = ref(false);
    const getPatternFn = (patternId) => {
      api.get("index/patterns/" + patternId).then((response) => {
        stopPointsOnPattern.value = response.data;
        showDialog.value = true;
      });
    };

    return {
      stop,
      dateModel,
      schedules,
      changeDateFn,
      getPatternFn,
      routes,
      stopPointsOnPattern,
      showDialog,
    };
  },
});
</script>
