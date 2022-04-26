<template>
  <div v-if="groups" class="q-pa-md row q-col-gutter-md">
    <div
      v-for="(type, idx) in Object.keys(groups) "
      v-bind:key="idx" class="col-6">
      <h4 @click="showLines = groups[type]">
        <trip-icon :mode="type"/>
      </h4>
      <q-list bordered>

        <q-item
          v-for="(line, line_idx) in groups[type]"
          v-bind:key="line_idx"
          v-ripple
          :to="'/linje/'+line.id"
          clickable
        >
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              {{ line.shortName }}
            </q-avatar>
          </q-item-section>

          <q-item-section>{{ line.longName }}</q-item-section>
        </q-item>
      </q-list>

      <pre>{{ showLines }}</pre>
    </div>

  </div>
</template>

<script>
import {defineComponent, ref} from "vue";
import {api} from "boot/axios";
import TripIcon from "components/TripIcon";

export default defineComponent({

  components: {
    TripIcon
  },

  name: "LinesPage",

  setup: function () {

    ['alerts', 'patterns', 'stops', 'trips'].forEach(type => {
      api.get('index/routes/AX:1/' + type).then(response => {
        //console.log(type, response.data)
      })
    })
    const groups = ref({})

    api.get('index/routes').then(response => {

      response.data = response.data.sort((a, b) => {
        const nameA = a.shortName.toUpperCase(); // ignore upper and lowercase
        const nameB = b.shortName.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      })

      const res = response.data.reduce((group, item) => {
        if (!group[item.mode]) {
          group[item.mode] = []
        } //If this type wasn't previously stored
        group[item.mode].push(item);
        return group;
      }, {});
      groups.value = res

    })

    const showLines = ref([])

    return {
      groups,
      showLines
    }

  },
})
</script>
