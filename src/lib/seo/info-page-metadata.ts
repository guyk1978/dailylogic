import enPages from "../../../locales/en/pages.json";
import esPages from "../../../locales/es/pages.json";
import hePages from "../../../locales/he/pages.json";
import { INFO_PAGES, type InfoPageKey } from "@/lib/info-pages";
import { absoluteUrl } from "@/lib/seo/site";
import { locales, type AppLocale } from "@/lib/i18n/settings";

const pageMessages = {
  en: enPages,
  he: hePages,
  es: esPages,
} as const;

export function getInfoPageMetadata(pageKey: InfoPageKey, locale: AppLocale) {
  const page = pageMessages[locale][pageKey];

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      languages: Object.fromEntries(
        locales.map((entry) => [
          entry,
          absoluteUrl(`/${entry}${INFO_PAGES[pageKey].path}`),
        ]),
      ),
    },
  };
}
