<template>
  <div class="row q-col-gutter-md">
    <div class="col-md-6 col-xs-12">
      <p>
        <q-input v-model="input" filled type="textarea" />
      </p>
      <p>
        <q-btn color="primary" @click="submitFn()">Test</q-btn>
      </p>
    </div>
    <div class="col-md-6 col-xs-12">
      <div class="text-h6">Results</div>
      <pre>{{ results }}</pre>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  components: {},

  name: "GraphQL",

  setup: function () {
    const input = ref("");
    const results = ref("");
    const submitFn = () => {
      api
        .post("index/graphql", {
          query: input.value,
        })
        .then((response) => {
          results.value = response.data;
        });
    };

    return {
      input,
      results,
      submitFn,
    };
  },
});
</script>

<style>
.col-md-6 {
  background-color: white;
}
</style>
