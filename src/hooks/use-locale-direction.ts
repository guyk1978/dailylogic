"use client";

import { useTranslation } from "react-i18next";
import {
  defaultLocale,
  isAppLocale,
  localeLabels,
  type AppLocale,
} from "@/lib/i18n/settings";

export function useAppLocale(): AppLocale {
  const { i18n } = useTranslation();
  return isAppLocale(i18n.language) ? i18n.language : defaultLocale;
}

export function useLocaleDirection(): "ltr" | "rtl" {
  const locale = useAppLocale();
  return localeLabels[locale].dir;
}

export function useLocaleTag(): string {
  const locale = useAppLocale();
  if (locale === "he") return "he-IL";
  if (locale === "es") return "es-ES";
  return "en-US";
}
