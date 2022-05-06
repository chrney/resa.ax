<template>
  <q-icon :name="$mode_to_icon(mode)"/>
</template>

<script>
import {defineComponent} from "vue";
import {QIcon} from "quasar"

export default defineComponent({
  name: "TripIcon",
  props: ["mode"],
  components: {QIcon}

});
</script>
