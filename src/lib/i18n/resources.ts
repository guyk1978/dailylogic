/**
 * Bundled translation resources per locale.
 * When adding a language: create `locales/{code}/common.json` and register it here.
 */
import type { AppLocale } from "@/lib/i18n/settings";
import en from "../../../locales/en/common.json";
import enPages from "../../../locales/en/pages.json";
import es from "../../../locales/es/common.json";
import esPages from "../../../locales/es/pages.json";
import he from "../../../locales/he/common.json";
import hePages from "../../../locales/he/pages.json";

export const localeResources = {
  en: { common: en, pages: enPages },
  he: { common: he, pages: hePages },
  es: { common: es, pages: esPages },
} satisfies Record<AppLocale, { common: typeof en; pages: typeof enPages }>;
