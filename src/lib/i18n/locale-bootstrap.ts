import {
  defaultLocale,
  localeLabels,
  LOCALE_STORAGE_KEY,
  locales,
} from "@/lib/i18n/settings";

const localeDirs = Object.fromEntries(
  locales.map((locale) => [locale, localeLabels[locale].dir]),
);

/**
 * Blocking inline script for `<head>` — runs before paint so `lang`/`dir` match
 * the resolved locale and avoids a language flicker on hydration.
 */
export function getLocaleBootstrapScript(): string {
  const config = {
    key: LOCALE_STORAGE_KEY,
    locales: [...locales],
    dirs: localeDirs,
    defaultLocale,
  };

  return `(function(){var c=${JSON.stringify(config)};function supported(v){return c.locales.indexOf(v)!==-1}function fromBrowser(){var lang=(navigator.language||navigator.userLanguage||"").toLowerCase();if(!lang)return c.defaultLocale;if(supported(lang))return lang;var base=lang.split("-")[0];return supported(base)?base:c.defaultLocale}function apply(loc){var dir=c.dirs[loc]||"ltr";document.documentElement.lang=loc;document.documentElement.dir=dir;if(document.body){document.body.lang=loc;document.body.dir=dir}}try{var stored=localStorage.getItem(c.key),locale;if(stored&&supported(stored)){locale=stored}else{locale=fromBrowser();localStorage.setItem(c.key,locale)}apply(locale);document.addEventListener("DOMContentLoaded",function(){apply(locale)})}catch(e){apply(c.defaultLocale)}})();`;
}
