<template>
  <q-timeline-entry
    :color="$get_bg_class_for_mode(leg)"
    :heading="1 !== 1"
    :icon="$mode_to_icon(leg.mode)"
    class="walk-mode"
  >
    <template v-if="leg.walkToOppositeBusStop">
      {{ $t("body.walk_to_opposite_bus_stop") }}&nbsp;
    </template>
    <template v-if="leg.to.busStopNumber !== '' && !leg.walkToOppositeBusStop">{{
        $t("body.distance_towards_without_stop", {
          distance: $get_distance_string(leg.distance),
          name: leg.to.name
        })
      }}
    </template>
    <template v-else>{{ $get_distance_string(leg.distance) }}</template>

    <!--

        <template v-if="leg.to.busStopNumber === ''">{{
            $t("body.distance_towards_without_stop", {
              distance: $get_distance_string(leg.distance),
              name: leg.to.name
            })
          }}
        </template>
    -->

  </q-timeline-entry>
</template>

<script>
import {defineComponent} from "vue";
import {QTimelineEntry} from "quasar"

export default defineComponent({
  name: "LegWalk",
  props: ["leg"],
  components: {QTimelineEntry},
  setup: () => {
  }

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

</style>
