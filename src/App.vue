<template>
  <div class="with-bg">
    <router-view/>
  </div>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: "App",
  setup: function () {

  }
});
</script>

<style>
body {
  background-image: url("assets/bg-image.jpeg");
  background-repeat: repeat;
  background-position: center;
  background-size: auto;
  background-attachment: fixed;


}
</style>
