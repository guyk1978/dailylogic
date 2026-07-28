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

/**
 * Load gtag.js and queue the standard init commands.
 * Important: push `arguments` (not a rest-parameter Array) — GA only processes Arguments objects.
 */
export function loadGoogleTag(measurementId: string = GA_MEASUREMENT_ID): void {
  if (typeof window === "undefined" || document.getElementById("google-gtag")) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // GA requires the Arguments object, not [...args].
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: true,
  });

  const script = document.createElement("script");
  script.id = "google-gtag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

/** Record a client-side navigation as a GA4 page_view. */
export function trackPageView(path: string, measurementId: string = GA_MEASUREMENT_ID): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: measurementId,
  });
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
