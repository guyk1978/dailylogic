"use client";

import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { initI18n, i18n } from "@/lib/i18n/client";
import {
  isAppLocale,
  localeLabels,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@/lib/i18n/settings";

initI18n();

function applyDocumentLocale(lng: string) {
  if (!isAppLocale(lng)) return;
  const dir = localeLabels[lng].dir;
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;
  document.body.dir = dir;
  document.body.lang = lng;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyDocumentLocale(i18n.language);

    const handler = (lng: string) => {
      applyDocumentLocale(lng);
    };

    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

/** Manual language selection — always persisted and takes precedence over auto-detection. */
export function setAppLocale(locale: AppLocale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore write errors.
  }

  applyDocumentLocale(locale);
  void i18n.changeLanguage(locale);
}
