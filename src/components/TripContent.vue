<template>
  <q-card>
    <trip-body :item="item"/>
  </q-card>
</template>

<script>
import {defineComponent} from "vue";
import TripBody from "components/TripBody";

export default defineComponent({
  name: "TripContent",
  components: {TripBody},
  props: ['item']
});
</script>
