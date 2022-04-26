<template>
  <div class="q-px-lg q-pb-md">
    <q-timeline
      v-for="(leg, idx) in item.graph"
      v-bind:key="idx"
      layout="dense"
    >
      <template v-if="leg.type === 'leg'">
        <template v-if="leg.mode === 'WALK'">
          <q-timeline-entry
            :color="$get_bg_class_for_mode(leg)"
            :heading="1 !== 1"
            :icon="$mode_to_icon(leg.mode)"
            class="walk-mode"
          >
            {{
              $t("body.distance_towards", {
                distance: $get_distance_string(leg.distance),
                name: leg.to.name,
                bus_stop: leg.from.stopId.slice(-1),
              })
            }}
          </q-timeline-entry>
        </template>
        <template v-if="leg.mode !== 'WALK'">
          <q-timeline-entry
            :color="$get_bg_class_for_mode(leg)"
            :subtitle="$formatTS(leg.startTime, 'HH:mm')"
            :title="leg.from.name"
            class="no-walk-mode"
            >{{ $t("body.stop") }} {{ leg.from.stopId.slice(-1) }}
          </q-timeline-entry>

          <!-- travel mode -->
          <q-timeline-entry
            :color="$get_bg_class_for_mode(leg)"
            :icon="$mode_to_icon(leg.mode)"
            class="no-walk-mode no-subtitle"
          >
            <template v-slot>
              {{ $t("body.line") }}
              <q-chip>{{ leg.routeShortName }}</q-chip>
              ({{ leg.route }})
              <trip-body-expanded :leg="leg" />
            </template>
          </q-timeline-entry>

          <!-- Endpoint -->
          <q-timeline-entry
            :color="$get_bg_class_for_mode(leg)"
            :subtitle="$formatTS(leg.endTime, 'HH:mm')"
            :title="leg.to.name"
            class="no-walk-mode"
          >
            <template v-if="leg.from.name === leg.to.name">
              {{ $t("body.stop") }} {{ leg.to.stopId.slice(-1) }}
            </template>
          </q-timeline-entry>
        </template>
      </template>

      <template v-if="leg.type === 'pause' && leg.secFormated > 1">
        <q-banner class="bg-grey-8 text-white">
          <template v-slot:avatar>
            <q-icon name="hourglass_top" />
          </template>
          {{ $t("body.waiting_time") }}: {{ leg.secFormated }} min
        </q-banner>
      </template>

      <!-- Starting point -->
    </q-timeline>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import TripBodyExpanded from "components/TripBodyExpanded.vue";

export default defineComponent({
  name: "TripBody",
  props: ["item"],
  components: {
    TripBodyExpanded,
  },
});
</script>

<style>
.walk-mode > .q-timeline__subtitle,
.walk-mode .q-timeline__title {
  display: none;
}

.walk-mode > .q-timeline__content {
  padding: 8px 0px 0px 0px;
  margin: 32px 0px 32px 0px;
}

.no-walk-mode {
  padding-bottom: 30px;
}

.no-walk-mode > .q-timeline__subtitle {
  /* Klockslag */
  margin-bottom: 0px;
}

.no-walk-mode > .q-timeline__content {
}

.no-walk-mode > .q-timeline__content .q-timeline__title {
  margin-bottom: 0px;
}

.no-walk-mode.no-subtitle > .q-timeline__subtitle {
  /* Klockslag */
  display: none;
}

.no-walk-mode.no-subtitle > .q-timeline__content {
  /* Klockslag */
  margin-bottom: 20px;
}
</style>
