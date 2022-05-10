<template>
  <q-spinner
    v-if="!is_loaded"
    :thickness="10"
    color="primary"
    size="3em"
  />
  <template v-if="is_loaded">
    <dropdown-picker
      :data="allStops"
      :label="$t('search.label_from')"
      :preset="point.from"
      direction="from"
      icon="start"
      @stopChosen="stopChosenFn"
    />
    <dropdown-picker
      :data="allStops"
      :label="$t('search.label_to')"
      :preset="point.to"
      direction="to"
      icon="start"
      @stopChosen="stopChosenFn"
    />

    <q-btn-toggle
      v-model="mode"
      :options="[
      { label: $t('search.btn_now'), value: 'now' },
      { label: $t('search.btn_departure'), value: 'departure' },
      { label: $t('search.btn_arrival'), value: 'arrival' },
    ]"
      class="q-mb-md"
      color="white"
      dense
      no-caps
      spread
      text-color="black"
      toggle-color="primary"
    />

    <div
      v-if="mode === 'arrival' || mode === 'departure'"
      class="row q-col-gutter-md"
    >
      <q-input
        v-model="dateModel"
        bg-color="white"
        class="q-mb-md col-6"
        dense
        filled
      >
        <template v-slot:prepend>
          <q-icon class="cursor-pointer" name="event">
            <q-popup-proxy
              ref="qDateProxy"
              cover
              transition-hide="scale"
              transition-show="scale"
            >
              <q-date v-model="dateModel" mask="YYYY-MM-DD" no-unset today-btn>
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    :label="$t('search.btn_close_calendar')"
                    color="primary"
                    flat
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        v-model="timeModel"
        :rules="['time']"
        bg-color="white"
        class="q-mb-md col-6"
        dense
        filled
        mask="time"
      >
        <template v-slot:prepend>
          <q-icon name="schedule"/>
        </template>
      </q-input>
    </div>

    <q-btn
      :disable="is_disabled"
      :label="$t('search.btn_search')"
      class="full-width"
      color="primary"
      icon="search"
      size="xl"
      stretch
      @click="searchFn()"
    />

    <div class="text-center">
      <q-btn
        v-if="!is_disabled"
        :disable="is_disabled"
        :label="$t('search.btn_search_swap')"
        class="q-mt-md"
        color="secondary"
        icon="import_export"
        size="md"
        @click="swapStopsFn"
      ></q-btn>
    </div>


    <span class="text-grey-5">
    <!--{{ $q.screen.width }} x {{ $q.screen.height }} | {{ $q.screen.name }}-->
  </span>
  </template>
</template>

<script>
import {computed, defineComponent, ref} from "vue";
import {formatTS, scroll_to_results} from "boot/generic";
import {find_trips, get_stops} from "boot/api";
import DropdownPicker from "components/DropdownPicker";
import {QBtn, QBtnToggle, QDate, QIcon, QInput, QPopupProxy, QSpinner} from "quasar"

export default defineComponent({
  name: "SearchForm",
  components: {DropdownPicker, QSpinner, QBtnToggle, QInput, QIcon, QPopupProxy, QDate, QBtn},
  emits: ["foundTrips", "searchState", "searchDate", "swapDropdown"],

  setup: (_, {emit}) => {
    const point = ref({});
    const allStops = ref([]);
    const mode = ref("now");
    const dateModel = ref(formatTS(Date.now(), "YYYY-MM-DD"));
    const timeModel = ref(formatTS(Date.now(), "HH:mm"));

    const is_loaded = ref(false)

    const is_disabled = computed(() => {
      return !(point.value.to && point.value.to.lat && point.value.from && point.value.from.lon)
    })

    const swapStopsFn = () => {
      let temp = point.value.to;
      point.value.to = point.value.from
      point.value.from = temp;
      searchFn()
    }

    const stopChosenFn = (data) => {
      point.value[data.direction] = data.stop;
    };


    get_stops()
      .then(result => {
        allStops.value = result
        is_loaded.value = true
      })


    const searchFn = () => {
      emit("searchState", "loading");
      scroll_to_results();
      find_trips(point, mode, dateModel, timeModel).then(data => {
        emit("searchState", "done");
        emit("foundTrips", data);
        scroll_to_results();
      });
    };

    return {
      allStops,
      searchFn,
      stopChosenFn,
      swapStopsFn,
      point,
      mode,
      dateModel,
      timeModel,
      is_disabled,
      is_loaded
    };
  },
});
</script>
