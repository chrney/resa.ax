<template>
  <q-card>
    <trip-body :item="item"/>
  </q-card>
</template>

<script>
import {defineComponent} from "vue";
import TripBody from "components/TripBody";
import {QCard} from "quasar"

export default defineComponent({
  name: "TripContent",
  components: {TripBody, QCard},
  props: ["item"],
});
</script>
