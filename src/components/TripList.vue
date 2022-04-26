<template>
  <template v-if="searchState === 'none'">
    <q-banner class="text-black bg-info">
      <q-icon color="primary" name="search"/>
      <template v-if="$q.screen.lt.md">{{ $t('results.nothing_searched_yet_above') }}.</template>
      <template v-else>{{ $t('results.nothing_searched_yet_left') }}</template>
    </q-banner>
  </template>

  <q-spinner
    v-if="searchState === 'loading'"
    :thickness="10"
    color="primary"
    size="3em"
  />

  <template v-if="searchState === 'done'">
    <q-banner v-if="trips.found_trips.length===0" class="text-black bg-negative">
      <template v-slot:avatar>
        <q-icon color="black" name="warning"/>
      </template>
      {{ $t('results.nothing_found') }}
    </q-banner>

    <template v-if="trips.found_trips.length>0">
      <template v-if="trips.search_date !== Object.keys(date_groups)[0]">
        <q-banner class="text-black bg-warning q-mb-md">
          <template v-slot:avatar>
            <q-icon color="black" name="warning"/>
          </template>
          {{ $t('results.found_for_next_day') }}.
        </q-banner>

      </template>
      <div v-for="(date, d_idx) in Object.keys(date_groups)" v-bind:key="d_idx">
        <div class="text-h6 text-center bg-grey-4">
          {{ $moment(date).format('dddd')[0].toLocaleUpperCase() + $moment(date).format('dddd').slice(1) }} {{
            $moment(date).format('LL')
          }}
        </div>
        <q-list class="q-mb-md bg-grey-2">
          <q-expansion-item
            v-for="(item, idx) in date_groups[date]"
            v-bind:key="idx" class="bg-white q-mb-sm"
            group="plan_details"
            header-class="text-primary"
          >

            <template v-slot:header>
              <div class="full-width">
                <trip-header :plan="item"/>
              </div>
            </template>
            <trip-content :item="item"/>
          </q-expansion-item>
        </q-list>
      </div>
    </template>
  </template>


</template>

<script>
import {defineComponent} from "vue";
import TripContent from "components/TripContent.vue";
import TripHeader from "components/TripHeader.vue";
import {moment} from "boot/generic";

export default defineComponent({
  name: "TripList",
  props: ['trips', 'searchState'],
  components: {
    TripContent,
    TripHeader
  },

  computed: {

    date_groups() {
      if (this.trips.found_trips) {
        return this.trips.found_trips.reduce((group, trip) => {
          const this_date = moment(trip.startTime).format('YYYY-MM-DD')
          if (!group[this_date]) {
            group[this_date] = []
          }
          group[this_date].push(trip);
          return group;
        }, {});
      }
      return {};
    },

  },
});
</script>
