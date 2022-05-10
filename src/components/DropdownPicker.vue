<template>
  <q-select
    v-model="model"
    :label="label"
    :option-disable="(item) => item.disable"
    :options="options"
    autocomplete="off"
    bg-color="white"
    class="q-mb-sm"
    display-value=""
    fill-input
    filled
    input-debounce="0"
    option-label="formatted"
    option-value="id"
    use-input
    @filter="filterFn"
    @update:model-value="updateFn"

  >
    <template v-slot:prepend>
      <q-icon :name="icon"/>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-black">
          {{ $t("dropdown.nothing_found") }}
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <q-icon v-if="scope.opt.gtfsId" color="primary" name="where_to_vote"/>
          <q-icon v-else color="grey-6" name="location_pin"/>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.formatted }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script>
import {defineComponent, ref, watch} from "vue";
import {QIcon, QItem, QItemSection, QSelect} from "quasar"
import {geo_lookup} from "boot/api";
import {useI18n} from 'vue-i18n'

export default defineComponent({
  name: "DropdownPicker",
  props: ["label", "data", "direction", "icon", "preset"],
  components: {QSelect, QIcon, QItem, QItemSection},
  emits: ["stopChosen", "virtual-scroll"],
  setup(props, context) {
    const {t} = useI18n()
    let lastVal = null;
    const all_stops = props.data.map(item => {
      item.formatted = item.name
      return item
    })

    watch(() => props.preset, (newValue) => {
      model.value = newValue
    });


    const weightedSearch = (array, weightedTests, sortProperty) => {
      return array
        .map((e) => {
          return {
            element: e,
            weight: weightedTests
              .map((weightedTest) => {
                return weightedTest.test(e) * weightedTest.weight;
              })
              .reduce((previousValue, currentValue) => {
                return previousValue + currentValue;
              }, 0),
          };
        })
        .filter((element) => element.weight > 0)
        .sort((obj1, obj2) => {
          //sort first by weight if possible
          const weightDifference = obj2.weight - obj1.weight;
          if (weightDifference) {
            return weightDifference;
          }

          if (obj1.element[sortProperty] < obj2.element[sortProperty]) {
            return -1;
          } else if (obj1.element[sortProperty] > obj2.element[sortProperty]) {
            return 1;
          }
          return 0;
        })
        .map((e) => {
          return e.element;
        });
    };

    const defaultOptions = () => {
      return all_stops.filter((item) => !!item.favorite);
    };


    let search_delay = null
    const filterFn = async (val, update) => {
      update(() => {
          if (lastVal !== "" && val === "" && model.value && model.value.formatted) {
            lastVal = val;
            val = model.value.formatted;
          }

          if (val === "") {
            setOptions(defaultOptions());
          } else {
            const needle = val.toLowerCase();
            if (search_delay) {
              clearTimeout(search_delay);
            }
            search_delay = setTimeout(function () {
              geo_lookup(needle).then(result => {

                let joined_list = [...result, ...all_stops]
                if (result.length === 0) {
                  joined_list = [...all_stops]
                }
                return weightedSearch(
                  joined_list,
                  [
                    {
                      test: function (testElement) {
                        return testElement.formatted.toLowerCase().indexOf(needle) === 0;
                      },
                      weight: 2,
                    },
                    {
                      test: function (testElement) {
                        return testElement.formatted.toLowerCase().indexOf(needle) >= 0;
                      },
                      weight: 0.5,
                    },
                  ],
                  "formatted"
                )
              }).then(result => {
                setOptions(result)
              })
            }, 250);
          }
        },

        (ref) => {
          if (val !== "" && ref.options && ref.options.length > 0) {
            ref.setOptionIndex(-1); // reset optionIndex in case there is something selected
            ref.moveOptionSelection(1, true); // focus the first selectable option and do not update the input-value
          }
        }
      );
    };


    const setOptions = (values) => {
      try {
        if (values.length > 0) {
          options.value = values
        } else { // add faked option
          options.value = [{
            formatted: t('dropdown.nothing_found'),
            disable: true
          }]
        }
      } catch (exception_var) {
      }
    }

    const updateFn = () => {
      context.emit("stopChosen", {
        direction: props.direction,
        stop: model.value,
      });
    };

    let options = ref(defaultOptions());
    let model = ref(null /*props.data.find((item) => item.id === props.preset)*/);

    return {
      options,
      filterFn,
      updateFn,
      model
    };
  },
})

</script>
