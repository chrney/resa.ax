<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="page-centered">
      <div class="q-pa-md">
        <router-view/>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: "GraphQLLayout",
});
</script>
