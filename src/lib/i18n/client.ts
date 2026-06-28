"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../../../public/locales/en/common.json";
import es from "../../../public/locales/es/common.json";
import he from "../../../public/locales/he/common.json";
import { resolveInitialLocale } from "@/lib/i18n/resolve-locale";
import {
  defaultLocale,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@/lib/i18n/settings";

const resources = {
  en: { common: en },
  he: { common: he },
  es: { common: es },
};

function readInitialLocale(): AppLocale {
  if (typeof window === "undefined") return defaultLocale;

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const locale = resolveInitialLocale({
      storedLocale: stored,
      browserLanguage: navigator.language,
    });

    if (!stored) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }

    return locale;
  } catch {
    return resolveInitialLocale({
      storedLocale: null,
      browserLanguage: navigator.language,
    });
  }
}

export function initI18n() {
  if (i18n.isInitialized) return i18n;

  i18n.use(initReactI18next).init({
    resources,
    lng: readInitialLocale(),
    fallbackLng: defaultLocale,
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  return i18n;
}

export { i18n };
