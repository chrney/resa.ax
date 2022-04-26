<template>
  <q-expansion-item
    :header-class="{ 'item-header': true }"
    dense
    group="stops_in_leg"
  >
    <template
      v-if="leg.intermediateStops && leg.intermediateStops.length > 0 && $t"
      v-slot:header
    >
      {{ $t("expanded.passing") }}&nbsp;<strong>{{
        leg.intermediateStops.length
      }}</strong
      >&nbsp;
      {{ $t("expanded.stops_plural", leg.intermediateStops.length) }}
    </template>

    <q-timeline :color="$get_bg_class_for_mode(leg)" class="sub_timeline">
      <q-timeline-entry
        v-for="(stop, stop_idx) in leg.intermediateStops"
        v-bind:key="stop_idx"
        :icon="$mode_to_icon(leg.mode)"
        :subtitle="$formatTS(stop.arrival, 'HH:mm')"
        :title="stop.name"
        dense
      >
        <template v-slot:title
          ><span class="title">{{ stop.name }}</span>
        </template>
      </q-timeline-entry>
    </q-timeline>
  </q-expansion-item>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "TripBodyExpanded",
  props: ["leg"],
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
  margin-bottom: 0px;
}

.sub_timeline .title {
  font-size: 14px;
}
</style>
