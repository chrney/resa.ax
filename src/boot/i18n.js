import { createI18n } from "vue-i18n";
import messages from "src/i18n";

export default ({ app }) => {
  // Create I18n instance
  const i18n = createI18n({
    legacy: false,
    locale: "sv_SE",
    messages,
  });

  // Tell app to use the I18n instance
  app.use(i18n);
};

const languages = [
  { key: "sv_SE", title: "Svenska", moment_key: "sv", file: "sv" },
  { key: "fi_FI", title: "Suomeksi", moment_key: "fi", file: "fi" },
  { key: "en_GB", title: "English", moment_key: "en", file: "en-GB" },
  { key: "de_DE", title: "Deutsch", moment_key: "de", file: "de" },
];

export { languages };
