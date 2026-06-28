export const GA_MEASUREMENT_ID = "G-GKZBNXWKZX";
export const CONSENT_STORAGE_KEY = "consent_given";

const SEARCH_ENGINE_BOT_PATTERN =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|applebot|facebookexternalhit|twitterbot|linkedinbot|embedly|pinterest|slackbot|whatsapp|lighthouse|pagespeed/i;

export function isSearchEngineBot(userAgent: string): boolean {
  return SEARCH_ENGINE_BOT_PATTERN.test(userAgent);
}

export function hasAnalyticsConsent(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveAnalyticsConsent(): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, "true");
  } catch {
    // Ignore storage errors.
  }
}

export function loadGoogleTag(measurementId: string = GA_MEASUREMENT_ID): void {
  if (typeof window === "undefined" || document.getElementById("google-gtag")) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  const script = document.createElement("script");
  script.id = "google-gtag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.onload = () => {
    window.gtag?.("js", new Date());
    window.gtag?.("config", measurementId);
  };
  document.head.appendChild(script);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
