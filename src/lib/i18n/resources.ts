/**
 * Bundled translation resources per locale.
 * When adding a language: create `locales/{code}/common.json` and register it here.
 */
import type { AppLocale } from "@/lib/i18n/settings";
import en from "../../../locales/en/common.json";
import es from "../../../locales/es/common.json";
import he from "../../../locales/he/common.json";

export const localeResources = {
  en: { common: en },
  he: { common: he },
  es: { common: es },
} satisfies Record<AppLocale, { common: typeof en }>;
