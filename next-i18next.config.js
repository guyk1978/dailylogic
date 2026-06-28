/** @type {import('next-i18next').UserConfig} */
const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "he", "es"],
  },
  localePath: path.resolve("./locales"),
  reloadOnPrerender: process.env.NODE_ENV === "development",
};
