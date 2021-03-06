import { boot } from "quasar/wrappers";
import moment from "moment";
import { Screen, scroll } from "quasar";

moment.locale("sv");
const { getScrollTarget, setVerticalScrollPosition } = scroll;

const scroll_to_results = () => {
  if (Screen.lt.md) {
    // scroll to search result
    const el = document.getElementById("search_result");
    const target = getScrollTarget(el);
    const offset = el.offsetTop - 50;
    const duration = 1000;
    setVerticalScrollPosition(target, offset, duration);
  }
};
const formatTS = (ts, str = "YYYY-MM-DD HH:mm") => moment(ts).format(str);

const mode_to_icon = (mode) => {
  let icon = "disabled_by_default";
  switch (mode) {
    case "BUS":
      icon = "directions_bus";
      break;
    case "WALK":
      icon = "directions_walk";
      break;
    case "FERRY":
      icon = "directions_boat";
      break;
    case "BICYCLE":
      icon = "directions_bike";
      break;

    case "CAR":
      icon = "directions_car";
      break;
  }
  return icon;
};

const get_mode_class = (leg) => {
  switch (leg.mode) {
    case "pause":
      return ["bg-grey-3", "text-black"];
    default:
      switch (leg.mode) {
        case "WALK":
          return ["bg-grey-5", "text-black"];
        case "BUS":
          return ["bg-blue", "text-white", "text-weight-bold"];

        case "FERRY":
          return ["bg-green", "text-white", "text-weight-bold"];

        case "BICYCLE":
          return ["bg-light-green", "text-black", "text-weight-bold"];

        case "CAR":
          return ["bg-deep-purple-10", "text-white", "text-weight-bold"];

        default:
          return ["bg-blue-4", "text-white", "text-weight-bold"];
      }
  }
};

const get_mode_color = (leg) => {
  switch (leg.mode) {
    case "WALK":
      return "#B7BCBE";
    case "BUS":
      return "#399BEC";
    case "FERRY":
      return "#5AB062";
    case "BICYCLE":
      return "#8CC24A";
    default:
      return "#00F";
  }
};

const get_bg_class_for_mode = (leg) => {
  return get_mode_class(leg)[0].replace("bg-", "");
};

const get_distance_string = (distance) => {
  if (distance > 200) {
    return (Math.round(distance / 100) * 100) / 1000 + " km";
  }
  if (distance > 0) {
    return parseInt(distance) + " m";
  }
  return "";
};

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$formatTS = formatTS;
  app.config.globalProperties.$moment = moment;
  app.config.globalProperties.$mode_to_icon = mode_to_icon;
  app.config.globalProperties.$get_distance_string = get_distance_string;
  app.config.globalProperties.$get_mode_class = get_mode_class;
  app.config.globalProperties.$get_bg_class_for_mode = get_bg_class_for_mode;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file
});

export {
  formatTS,
  moment,
  mode_to_icon,
  get_distance_string,
  get_mode_class,
  get_bg_class_for_mode,
  scroll_to_results,
  get_mode_color,
};
