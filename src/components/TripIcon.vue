<template>
  <q-icon :name="$mode_to_icon(mode)"/>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: "TripIcon",
  props: ['mode'],
});
</script>
