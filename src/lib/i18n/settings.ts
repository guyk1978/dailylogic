export const defaultLocale = "en" as const;
export const locales = ["en", "he", "es"] as const;
export type AppLocale = (typeof locales)[number];

export const LOCALE_STORAGE_KEY = "dailylogic:locale";
export const LOCALE_COOKIE_KEY = "dailylogic:locale";

export const localeLabels: Record<
  AppLocale,
  { code: string; native: string; dir: "ltr" | "rtl" }
> = {
  en: { code: "EN", native: "English", dir: "ltr" },
  he: { code: "HE", native: "עברית", dir: "rtl" },
  es: { code: "ES", native: "Español", dir: "ltr" },
};

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
