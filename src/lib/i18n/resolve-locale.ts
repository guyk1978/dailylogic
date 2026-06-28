import {
  defaultLocale,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/settings";

/** Map `navigator.language` (e.g. `he-IL`, `es-MX`) to a supported locale. */
export function resolveLocaleFromBrowser(
  language: string | undefined | null,
): AppLocale {
  const normalized = (language ?? "").toLowerCase();
  if (!normalized) return defaultLocale;

  if (isAppLocale(normalized)) return normalized;

  const base = normalized.split("-")[0];
  if (isAppLocale(base)) return base;

  return defaultLocale;
}

/**
 * Resolve the active locale: stored preference wins; otherwise use the browser language.
 * Used on first visit and kept in sync with the inline bootstrap script in layout.
 */
export function resolveInitialLocale(options: {
  storedLocale: string | null;
  browserLanguage?: string | null;
}): AppLocale {
  const { storedLocale, browserLanguage } = options;

  if (storedLocale && isAppLocale(storedLocale)) {
    return storedLocale;
  }

  return resolveLocaleFromBrowser(browserLanguage);
}
