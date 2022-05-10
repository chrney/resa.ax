<template>
  <p> {{ $t("body.distance") }}: <strong>{{ (leg.distance / 1000).toFixed(1) }}</strong> km</p>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: "LegBike",
  props: ["leg"],
  components: {},
  setup: () => {
  }
});
</script>
