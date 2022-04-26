<template>
  <div class="q-pa-md row q-col-gutter-md">
    <div class="col-12">
      <div class="text-h6 q-mb-md">
        Linje
        <q-chip>{{ line.shortName }}</q-chip>
        {{ line.longName }}
      </div>
      <div id="map" style="height: 70vh"></div>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { api } from "boot/axios";

import { useRoute } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});
export default defineComponent({
  components: {},

  name: "StopsPage",

  setup: function () {
    const route = useRoute();
    const id = route.params.lineId;
    const line = ref({});

    api.get("index/routes/" + id).then((response) => {
      line.value = response.data;
    });

    onMounted(() => {
      api.get("index/routes/" + id + "/stops").then((response) => {
        const center = [60, 20];
        let markers = response.data;
        let lat_lons = [];
        markers.forEach((stop) => {
          lat_lons.push([stop.lat, stop.lon]);
        });

        const myMap = L.map("map", {
          center,
          minZoom: 1,
          zoom: 10,
        });

        myMap.fitBounds(new L.LatLngBounds(lat_lons)); //Centers and zooms the map around the bounds

        markers.forEach((marker) => {
          var popupLink =
            '<a href="/#/hallplats/' + marker.id + '">' + marker.name + "</a>";

          new L.marker([marker.lat, marker.lon])
            .bindPopup(popupLink)
            .addTo(myMap);
        });
        L.tileLayer(
          "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
          {
            maxZoom: 18,
            attribution:
              'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: "mapbox/streets-v11",
            tileSize: 512,
            zoomOffset: -1,
          }
        ).addTo(myMap);
      });
    });

    return {
      line,
    };
  },
});
</script>
