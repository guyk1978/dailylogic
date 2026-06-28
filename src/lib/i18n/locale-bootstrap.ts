import {
  defaultLocale,
  localeLabels,
  locales,
  LOCALE_STORAGE_KEY,
} from "@/lib/i18n/settings";

const localeDirs = Object.fromEntries(
  locales.map((locale) => [locale, localeLabels[locale].dir]),
);

/**
 * Blocking inline script for `<head>` — reads locale from the URL path before paint
 * so `lang`/`dir` match the route and avoid a layout flicker on hydration.
 */
export function getLocaleBootstrapScript(): string {
  const config = {
    key: LOCALE_STORAGE_KEY,
    locales: [...locales],
    dirs: localeDirs,
    defaultLocale,
  };

  return `(function(){var c=${JSON.stringify(config)};function supported(v){return c.locales.indexOf(v)!==-1}function fromPath(){var seg=(window.location.pathname||"").split("/").filter(Boolean)[0];return seg&&supported(seg)?seg:null}function apply(loc){var dir=c.dirs[loc]||"ltr";document.documentElement.lang=loc;document.documentElement.dir=dir;if(document.body){document.body.lang=loc;document.body.dir=dir}}try{var locale=fromPath()||c.defaultLocale;apply(locale);localStorage.setItem(c.key,locale);document.addEventListener("DOMContentLoaded",function(){apply(locale)})}catch(e){apply(c.defaultLocale)}})();`;
}
