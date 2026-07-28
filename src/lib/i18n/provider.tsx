"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { initI18n, i18n } from "@/lib/i18n/client";
import {
  isAppLocale,
  localeLabels,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  defaultLocale,
  type AppLocale,
} from "@/lib/i18n/settings";

initI18n();

function applyDocumentLocale(lng: string) {
  if (typeof document === "undefined" || !isAppLocale(lng)) return;
  const dir = localeLabels[lng].dir;
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;
  if (document.body) {
    document.body.dir = dir;
    document.body.lang = lng;
  }
}

function persistLocale(locale: AppLocale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale};path=/;max-age=31536000;samesite=lax`;
  } catch {
    // Ignore persistence errors.
  }
}

export function I18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: AppLocale;
}) {
  const instance = useMemo(() => {
    initI18n(locale);
    return i18n.cloneInstance({
      lng: locale,
      fallbackLng: locale === "en" ? false : [locale, defaultLocale],
    });
  }, [locale]);

  useEffect(() => {
    persistLocale(locale);
    applyDocumentLocale(locale);
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  useEffect(() => {
    const handler = (lng: string) => {
      applyDocumentLocale(lng);
    };

    instance.on("languageChanged", handler);
    return () => {
      instance.off("languageChanged", handler);
    };
  }, [instance]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

/** Sync i18n + persistence when navigating via URL locale change. */
export function setAppLocale(locale: AppLocale) {
  persistLocale(locale);
  applyDocumentLocale(locale);
  void i18n.changeLanguage(locale);
}

/** Access the translation function from react-i18next in client components. */
export { useTranslation } from "react-i18next";
