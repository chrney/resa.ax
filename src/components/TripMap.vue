<template>
  <div class="q-px-lg q-pb-md">
    <q-expansion-item
      :label="$t('map.show')"
      class="q-ma-none q-pa-none"
      expand-separator
      icon="map"
      @after-show="resizeWindowFn"
    >
      <div :id="item.unique_id" :style="$q.screen.lt.md ? 'height: 55vw' : 'height: 35vw'" class="q-mt-md"></div>

    </q-expansion-item>
  </div>
</template>

<script>
import {defineComponent, onMounted} from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {QExpansionItem} from "quasar";
import {get_mode_color} from "boot/generic";
import polyUtil from "polyline-encoded";

require('leaflet-fullscreen/dist/Leaflet.fullscreen.min')
require('leaflet-fullscreen/dist/leaflet.fullscreen.css')
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [12, 20], // size of the icon
  shadowSize: [24, 42], // size of the shadow
  iconAnchor: [6, 20], // point of the icon which will correspond to marker's location
  shadowAnchor: [6, 40],  // the same for the shadow
  popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor

});


export default defineComponent({
  name: "TripMap",
  props: ["item"],
  components: {QExpansionItem},
  setup: (props) => {
    const center = [60, 20];
    const resizeWindowFn = () => {
      window.dispatchEvent(new Event("resize"));
    }

    onMounted(() => {

      const create_map = () => {
        const myMap = L.map(props.item.unique_id, {

          fullscreenControl: {
            pseudoFullscreen: false
          }
        }).setView(center, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(myMap);

        let polyline_list = [];
        let stop_list = [];
        let markers_list = [];

        props.item.legs.forEach((leg, idx) => {
          let polyline = L.Polyline.fromEncoded(leg.legGeometry.points,
            {
              color: get_mode_color(leg)
            });
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

        let markers = []
        markers_list.forEach((marker) => {
          let m = new L.marker(marker).addTo(myMap);
          markers.push(m)
        });

        stop_list.forEach((stop) => {
          L.circleMarker(stop, {
            color: "red",
            fillColor: "#f03",
            fillOpacity: 0.5,
            radius: 2,
            weight: 0,
          }).addTo(myMap);
        });

        let group = new L.featureGroup(markers);
        let bounds = group.getBounds()

        myMap
          .fitBounds(bounds, {maxZoom: 13})
          .setZoom(9);
      }

      setTimeout(() => {
        create_map();
        resizeWindowFn()
      }, 1000)

    });

    return {
      resizeWindowFn
    };
  },
});
</script>
