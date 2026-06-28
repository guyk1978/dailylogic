"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  defaultLocale,
  isAppLocale,
  localeLabels,
  type AppLocale,
} from "@/lib/i18n/settings";

export function useAppLocale(): AppLocale {
  const params = useParams();
  const { i18n } = useTranslation();

  const paramLocale = params?.locale;
  if (typeof paramLocale === "string" && isAppLocale(paramLocale)) {
    return paramLocale;
  }

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
