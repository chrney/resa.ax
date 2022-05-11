<template>
  <q-expansion-item
    :header-class="{ 'item-header': true }"
    dense
    group="stops_in_leg"
  >
    <template
      v-if="leg.intermediatePlaces && leg.intermediatePlaces.length > 0 && $t"
      v-slot:header
    >
      {{ $t("expanded.passing") }}&nbsp;<strong>{{
        leg.intermediatePlaces.length
      }}</strong
    >&nbsp;
      {{ $tc("expanded.stops_plural", leg.intermediatePlaces.length) }}
    </template>

    <q-timeline :color="$get_bg_class_for_mode(leg)" class="sub_timeline">
      <q-timeline-entry
        v-for="(place, stop_idx) in leg.intermediatePlaces"
        v-bind:key="stop_idx"
        :icon="$mode_to_icon(leg.mode)"
        :subtitle="$formatTS(place.arrivalTime, 'HH:mm')"
        :title="place.stop.name"
        dense
      >
        <template v-slot:title
        ><span class="title">{{ place.stop.name }}</span>
        </template>
      </q-timeline-entry>
    </q-timeline>
  </q-expansion-item>
</template>

<script>
import {defineComponent} from "vue";
import {QExpansionItem, QTimeline, QTimelineEntry} from "quasar";

export default defineComponent({
  name: "TripBodyExpanded",
  props: ["leg"],
  components: {QExpansionItem, QTimeline, QTimelineEntry}
});
</script>

<style>
.item-header {
  line-height: 2;
}

body.desktop .item-header.q-hoverable:hover > .q-focus-helper {
  background-color: white;
}

.sub_timeline {
  margin-left: 8px;
}

.sub_timeline .q-timeline__subtitle {
  margin-bottom: 0;
}

.sub_timeline .title {
  font-size: 14px;
}
</style>
