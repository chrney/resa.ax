<template>
  <div
    class="full-width row wrap justify-start items-start content-start q-col-gutter-md text-black"
  >
    <div class="col-6">
      <strong
      >{{ $moment(plan.startTime).format("LT") }} ~
        {{ $moment(plan.endTime).format("LT") }}</strong
      >
    </div>
    <div class="col-6 text-right text-grey">
      {{ $t("header.duration") }}: {{ plan.duration }}
    </div>

    <div class="col-12">
      <template v-for="(leg, idx) in plan.graph" v-bind:key="idx">
        <div
          :style="{ width: leg.percentage + '%' }"
          style="display: inline-block; overflow: hidden; white-space: nowrap"
        >
          <q-tooltip>
            <template v-if="leg.type === 'leg'">
              <template v-if="leg.mode !== 'WALK'">
                {{ $t("header.line") }} <strong>{{ leg.routeShortName }}</strong
              >:
                {{ $t("header.duration_hours", {time: leg.secFormated}) }}
              </template>
              <template v-if="leg.mode === 'WALK'">
                {{ $t("header.walk") }}: {{ leg.secFormated }}
                {{ $t("header.minutes") }}
              </template>
            </template>
            <template v-if="leg.type !== 'leg'">
              {{ $t("header.waiting_time") }} {{ leg.secFormated }}
              {{ $t("header.minutes") }}
            </template>
          </q-tooltip>

          <div
            :class="leg.color"
            class="q-pa-xs"
            style="border-right: 2px solid white"
          >
            <template v-if="leg.type === 'leg'">
              <trip-icon :mode="leg.mode"/>&nbsp;
              <template v-if="leg.mode !== 'WALK'">
                {{ leg.routeShortName }}
              </template>
              <span v-if="leg.mode === 'WALK'">{{
                  leg.secFormated === 0 ? 1 : leg.secFormated
                }}</span>
            </template>
            <template v-if="leg.type === 'pause'">
              <q-icon name="hourglass_top"/>
              {{ leg.secFormated }}
              {{ leg.secFormated > 100 ? $t("header.minutes") : "" }}
            </template>
          </div>
        </div>
      </template>
    </div>

    <div class="col-12">
      {{ $t("header.in_the_future") }}
      <strong>
        <template v-if="plan.days_absolute > 0">
          {{ $tc("header.in_x_days_singular_plural", plan.days_absolute) }}&nbsp;
        </template>
        <template v-if="plan.diff.hours() > 0 || plan.diff.days() > 0">
          {{ $t("header.hours", {hours: plan.diff.hours()}) }}&nbsp;
        </template>
        <template
          v-if="
            plan.diff.minutes() > 0 ||
            plan.diff.hours() > 0 ||
            plan.diff.days() > 0
          "
        >{{ plan.diff.minutes() }} {{ $t("header.minutes") }}
        </template>
      </strong>
      {{ $t("header.from_name") }} <strong>{{ plan.search.from.name }}</strong>
    </div>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import TripIcon from "components/TripIcon";

export default defineComponent({
  name: "TripHeader",
  props: ["plan"],
  components: {TripIcon},
});
</script>
