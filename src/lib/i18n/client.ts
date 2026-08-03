"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { localeResources } from "@/lib/i18n/resources";
import { getPathnameLocaleOrDefault } from "@/lib/i18n/paths";
import {
  defaultLocale,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@/lib/i18n/settings";

function readInitialLocale(): AppLocale {
  if (typeof window === "undefined") return defaultLocale;

  const fromUrl = getPathnameLocaleOrDefault(window.location.pathname);
  if (fromUrl) return fromUrl;

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && stored in localeResources) {
      return stored as AppLocale;
    }
  } catch {
    // Ignore read errors.
  }

  return defaultLocale;
}

export function initI18n(locale?: AppLocale) {
  const resolved = locale ?? readInitialLocale();

  if (i18n.isInitialized) {
    // Keep bundles in sync when locale JSON changes (HMR / new keys).
    for (const [lng, bundles] of Object.entries(localeResources)) {
      for (const [ns, resources] of Object.entries(bundles)) {
        i18n.addResourceBundle(lng, ns, resources as object, true, true);
      }
    }
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
    return i18n;
  }

  i18n.use(initReactI18next).init({
    resources: localeResources,
    lng: resolved,
    fallbackLng: {
      es: [defaultLocale],
      he: [defaultLocale],
      default: [defaultLocale],
    },
    defaultNS: "common",
    ns: [
      "common",
      "pages",
      "budgetPlanner",
      "timeValue",
      "tipSplit",
      "recipeAdjuster",
      "unitCompare",
      "loveCalculator",
      "relationshipDepth",
      "businessPartnership",
      "pocketMoney",
      "dogOwnership",
      "parentRespect",
      "strangerSharing",
      "ingredients",
    ],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    returnNull: false,
    returnEmptyString: false,
  });

  return i18n;
}

export { i18n };
