<template>
  <q-layout view="lHh Lpr lFf">


    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Ålandstrafikens reseplanerare</q-toolbar-title>

        <q-separator/>
        <span class="text-grey-4 q-mr-md">v1.0b</span>
        <q-btn
          aria-label="Menu"
          dense
          flat
          icon="more_vert"
          round
          @click="toggleLeftDrawer"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      side="right"
    >
      <q-list>
        <q-item-label header>
          Choose language
        </q-item-label>

        <q-item v-for="(l, l_idx) in languages" v-bind:key="l_idx"
                clickable
                tag="span"
        >
          <q-item-section @click="changeLanguageFn(l)">
            <q-item-label>{{ l.title }}</q-item-label>
          </q-item-section>
        </q-item>


      </q-list>
    </q-drawer>

    <q-page-container class="page-centered">
      <div class="q-pa-md">
        <router-view/>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import {defineComponent, ref} from "vue";

import {scroll} from "quasar";
import {moment, scroll_to_results} from "boot/generic";

const {getScrollTarget, setVerticalScrollPosition} = scroll;

export default defineComponent({
  name: "MainLayout",

  methods: {
    async changeLanguageFn(locale) {
      this.$i18n.locale = locale.key
      this.leftDrawerOpen = false
      moment.locale(locale.moment_key)
      await import('quasar/lang/' + locale.file)
        .then(lang => {
          this.$q.lang.set(lang.default)
        })

      //this.$q.lang.set(first_part)
    }
  },

  watch: {
    // whenever question changes, this function will run
    leftDrawerOpen(newVal) {
      if (newVal === true) {
        scroll_to_results()
      }
    }
  },


  setup: function () {
    const leftDrawerOpen = ref(false)

    const languages = [
      {key: 'sv_SE', title: 'Svenska', moment_key: 'sv', file: 'sv'},
      {key: 'fi_FI', title: 'Suomeksi', moment_key: 'fi', file: 'fi'},
      {key: 'en_GB', title: 'English', moment_key: 'en', file: 'en-GB'},
      {key: 'de_DE', title: 'Deutsch', moment_key: 'de', file: 'sv'},

    ]
    return {
      languages,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }

  }
});
</script>

<style scoped>
.page-centered {
  margin-left: auto;
  margin-right: auto;
  max-width: 1280px;
}
</style>
