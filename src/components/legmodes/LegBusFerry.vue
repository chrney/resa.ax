<template>
  <q-timeline-entry
    :color="$get_bg_class_for_mode(leg)"
    :subtitle="$formatTS(leg.startTime, 'HH:mm')"
    :title="leg.from.name"
    class="no-walk-mode"
  ><!--{{ $t("body.stop") }} {{ leg.from.busStopNumber }}-->
  </q-timeline-entry>

  <!-- travel mode -->
  <q-timeline-entry
    :color="$get_bg_class_for_mode(leg)"
    :icon="$mode_to_icon(leg.mode)"
    class="no-walk-mode no-subtitle"
  >
    <template v-slot>
      {{ $t("body.line") }}
      <q-chip>{{ leg.route.shortName }}</q-chip>
      ({{ leg.route.longName }})
      <trip-body-expanded :leg="leg"/>
    </template>
  </q-timeline-entry>

  <!-- Endpoint -->
  <q-timeline-entry
    :color="$get_bg_class_for_mode(leg)"
    :subtitle="$formatTS(leg.endTime, 'HH:mm')"
    :title="leg.to.name"
    class="no-walk-mode"
  >
  </q-timeline-entry>

</template>

<script>
import {defineComponent} from "vue";
import {QChip, QTimelineEntry} from "quasar"
import TripBodyExpanded from "components/TripBodyExpanded";

export default defineComponent({
  name: "LegBusFerry",
  props: ["leg"],
  components: {QTimelineEntry, QChip, TripBodyExpanded},
  setup: () => {
  }

});
</script>


<style>

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
