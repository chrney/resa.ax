<template>
  <q-banner class="bg-grey-8 text-white">
    <template v-slot:avatar>
      <q-icon name="hourglass_top"/>
    </template>
    {{ $t("body.waiting_time") }}: {{ leg.secFormated }} min
  </q-banner>
</template>

<script>
import {defineComponent} from "vue";
import {QBanner, QIcon} from "quasar"

export default defineComponent({
  name: "LegPause",
  props: ["leg"],
  components: {QBanner, QIcon},
});
</script>
