<template>

  <q-select
    v-model="model"
    :label="label"
    :options="options"
    autocomplete="off"
    bg-color="white"
    class="q-mb-sm"
    display-value=""
    fill-input
    filled
    input-debounce="0"
    option-disable="isDisabled"
    option-label="name"
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
        <q-item-section class="text-grey">
          {{ $t('dropdown.nothing_found') }}
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">

        <q-item-section>
          <q-item-label>{{ scope.opt.name }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>

</template>

<script>
import {defineComponent, ref} from "vue";

export default defineComponent({
  name: "DropdownPicker",
  props: ['label', 'data', 'direction', 'icon'],
  components: {},
  emits: ["stopChosen"],
  setup(props, context) {

    let lastVal = null

    const weightedSearch = (array, weightedTests, sortProperty) => {
      return array.map(e => {
        return {
          element: e,
          weight: weightedTests.map(weightedTest => {
            return weightedTest.test(e) * weightedTest.weight;
          }).reduce((previousValue, currentValue) => {
            return previousValue + currentValue;
          }, 0)
        };
      }).filter(element => element.weight > 0).sort((obj1, obj2) => {
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
      }).map(e => {
        return e.element;
      });
    }

    const defaultOptions = () => {
      return props.data.filter(item => !!item.favorite)
    }

    const filterFn = (val, update, abort) => {
      update(() => {

          if (lastVal !== '' && val === '' && model.value && model.value.name) {
            lastVal = val
            val = model.value.name
          }

          if (val === '') {
            options.value = defaultOptions()
          } else {
            const needle = val.toLowerCase()
            options.value = weightedSearch(props.data, [
              { /* primary sort: by beginning of string */
                test: function (testElement) {
                  return testElement.name.toLowerCase().indexOf(needle) === 0;
                }, weight: 2
              },
              { /* secondary sort: check if search phrase is somewhere in the name */
                test: function (testElement) {
                  return testElement.name.toLowerCase().indexOf(needle) >= 0;
                }, weight: 0.5
              }
            ], "title")

          }
        },

        ref => {
          if (val !== '' && ref.options && ref.options.length > 0) {
            ref.setOptionIndex(-1) // reset optionIndex in case there is something selected
            ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
          }
        }
      )
    }

    const updateFn = () => {
      context.emit('stopChosen', {
        direction: props.direction,
        stop: model.value
      })

    }


    const options = ref(defaultOptions())
    let model = ref(props.data.find(item => item.id === props.preset))

    return {
      options,
      filterFn,
      updateFn,
      model
    }

  }
})

</script>
