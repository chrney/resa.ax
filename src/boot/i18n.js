import { createI18n } from "vue-i18n";
import messages from "src/i18n";
import moment from "moment";
import { Quasar } from "quasar";

const languages = [
  { key: "sv_SE", title: "Svenska", moment_key: "sv", file: "sv" },
  { key: "fi_FI", title: "Suomeksi", moment_key: "fi", file: "fi" },
  { key: "en_GB", title: "English", moment_key: "en", file: "en-GB" },
  { key: "de_DE", title: "Deutsch", moment_key: "de", file: "de" },
];

export default ({ app }) => {
  // Create I18n instance
  const defaultLocale = Quasar.lang.isoName;

  const i18n = createI18n({
    // legacy: false,
    locale: "sv_SE",
    defaultLocale,
    messages,
  });

  app.config.globalProperties.$moment = moment;
  // Tell app to use the I18n instance
  app.use(i18n);
};

let current_locale = "";

const set_locale = (locale) => {
  moment.locale(locale);
};

const get_locale = () => {
  return current_locale;
};
set_locale("sv");
//moment.locale("fi");

export { languages, get_locale, set_locale, current_locale };
