<!--suppress ALL -->
<template>
  <div class="q-px-lg q-pb-md">
    <trip-map :item="item"/>

    <q-timeline
      v-for="(leg, idx) in item.graph"
      v-bind:key="idx"
      layout="dense"
    >
      <template v-if="leg.type === 'leg'">
        <leg-walk v-if="leg.mode === 'WALK'" :leg="leg"/>
        <leg-bus-ferry v-if="['FERRY','BUS'].includes(leg.mode)" :leg="leg"/>
        <leg-bike v-if="['CAR', 'BICYCLE'].includes(leg.mode)" :leg="leg"/>
      </template>

      <leg-pause
        v-if="leg.type === 'pause' && leg.secFormated > 1"
        :leg="leg"/>


      <!-- Starting point -->
    </q-timeline>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import TripMap from "components/TripMap";
import {QTimeline} from "quasar"
import LegWalk from "components/legmodes/LegWalk";
import LegPause from "components/legmodes/LegPause";
import LegBusFerry from "components/legmodes/LegBusFerry";
import LegBike from "components/legmodes/LegBike";

export default defineComponent({
  name: "TripBody",
  props: ["item"],
  components: {
    LegWalk,
    LegPause,
    TripMap,
    LegBusFerry,
    LegBike,

    QTimeline,
  },
});
</script>
