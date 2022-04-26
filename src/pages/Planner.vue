<template>
  <div class="row q-col-gutter-md">
    <div class="col-md-6 col-xs-12">
      <div class="box-background q-pa-md">
        <search-form @found-trips="foundTripsFn" @search-state="searchStateFn"/>
      </div>
    </div>
    <div class="col-md-6 col-xs-12">
      <div id="search_result" class="box-background q-pa-md">
        <trip-list :searchState="searchState" :trips="found_trips"/>
      </div>
    </div>
  </div>
</template>

<script>
import {defineComponent, ref} from "vue";
import TripList from "components/TripList.vue";
import SearchForm from "components/SearchForm";

export default defineComponent({

  components: {
    SearchForm,
    TripList,
  },
  emits: ["foundTrips", "loadingState"],

  name: "PlannerPage",


  setup: function () {

    const found_trips = ref(null)

    const foundTripsFn = (data) => {
      found_trips.value = data
    }
    const searchState = ref('none')
    const searchStateFn = (data) => {
      searchState.value = data
    }

    return {
      found_trips,
      foundTripsFn,

      searchState,
      searchStateFn,

    }
  }
})
</script>

<style scoped>
.box-background {
  background: rgba(95%, 95%, 95%, 0.75)
}
</style>
