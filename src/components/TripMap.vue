<template>
  <div class="q-px-lg q-pb-md">
    <q-expansion-item
      :label="$t('map.show')"
      expand-separator
      icon="map"
      @after-show="resizeWindow"
    >
      <q-card>
        <q-card-section>
          <div :id="item.unique_id" style="height: 20vw"></div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script>
import { defineComponent, nextTick, onMounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import polyUtil from "polyline-encoded";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default defineComponent({
  name: "TripBody",
  props: ["item"],
  components: {},

  methods: {
    resizeWindow() {
      window.dispatchEvent(new Event("resize"));
    },
  },

  setup: (props, { emit }) => {
    const center = [60, 20];

    onMounted(() => {
      const myMap = L.map(props.item.unique_id, {
        center,
        minZoom: 8,
        zoom: 14,
      });

      let polyline_list = [];
      let stop_list = [];
      let markers_list = [];

      props.item.legs.forEach((leg, idx) => {
        let polyline = L.Polyline.fromEncoded(leg.legGeometry.points);
        let points_in_line = polyUtil.decode(leg.legGeometry.points);

        markers_list.push(points_in_line[points_in_line.length - 1]);
        if (idx === 0) {
          markers_list.push(points_in_line[0]);
        }
        if (leg.intermediatePlaces) {
          leg.intermediatePlaces.forEach((place) => {
            stop_list.push([place.stop.lat, place.stop.lon]);
          });
        }

        polyline_list.push(polyline);
        polyline.addTo(myMap);
      });

      markers_list.forEach((marker) => {
        new L.marker(marker).addTo(myMap);
      });

      stop_list.forEach((stop) => {
        L.circleMarker(stop, {
          color: "red",
          fillColor: "#f03",
          fillOpacity: 0.5,
          radius: 2,
          weight: 1,
        }).addTo(myMap);
      });

      let latlngs = polyline_list.map((line) => line.getLatLngs());
      let latlngBounds = L.latLngBounds(latlngs);
      nextTick(() => {
        myMap
          .fitBounds(latlngBounds)
          .setZoom(myMap.getBoundsZoom(latlngBounds));
      });

      //myMap.fitBounds(latlngBounds)//.setZoom(myMap.getBoundsZoom(latlngBounds))
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

    return {};
  },
});
</script>
