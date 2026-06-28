"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { I18nextProvider } from "react-i18next";
import { useTranslation } from "@/lib/i18n/provider";
import { initI18n, i18n } from "@/lib/i18n/client";
import { getPathnameLocaleOrDefault } from "@/lib/i18n/paths";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import {
  CONSENT_STORAGE_KEY,
  GA_MEASUREMENT_ID,
  hasAnalyticsConsent,
  isSearchEngineBot,
  loadGoogleTag,
  saveAnalyticsConsent,
} from "@/lib/analytics/google-tag";

type GateState = "loading" | "open" | "closed";

function CookieConsentModal({
  onAccept,
  onDeny,
}: {
  onAccept: () => void;
  onDeny: () => void;
}) {
  const { t } = useTranslation("common");
  const dir = useLocaleDirection();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      dir={dir}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-soft ring-1 ring-slate-100">
        <p className="label-caption mb-3 text-blue-500">{t("consent.caption")}</p>
        <h1
          id="cookie-consent-title"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          {t("consent.title")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {t("consent.description")}
        </p>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onDeny} className="btn-secondary w-full sm:w-auto">
            {t("consent.deny")}
          </button>
          <button type="button" onClick={onAccept} className="btn-primary w-full sm:w-auto">
            {t("consent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CookieConsentGateInner({ children }: { children: ReactNode }) {
  const [gateState, setGateState] = useState<GateState>("loading");

  const setBodyScrollLocked = useCallback((locked: boolean) => {
    document.body.style.overflow = locked ? "hidden" : "";
  }, []);

  useEffect(() => {
    const userAgent = navigator.userAgent;

    if (isSearchEngineBot(userAgent)) {
      setGateState("closed");
      return;
    }

    if (hasAnalyticsConsent()) {
      loadGoogleTag(GA_MEASUREMENT_ID);
      setGateState("closed");
      return;
    }

    setGateState("open");
  }, []);

  useEffect(() => {
    setBodyScrollLocked(gateState === "open" || gateState === "loading");
    return () => setBodyScrollLocked(false);
  }, [gateState, setBodyScrollLocked]);

  const handleAccept = () => {
    saveAnalyticsConsent();
    loadGoogleTag(GA_MEASUREMENT_ID);
    setGateState("closed");
    setBodyScrollLocked(false);
  };

  const handleDeny = () => {
    setGateState("open");
    setBodyScrollLocked(true);
  };

  const isBlocking = gateState === "open" || gateState === "loading";

  return (
    <>
      <div
        className={isBlocking ? "pointer-events-none select-none" : undefined}
        aria-hidden={isBlocking}
      >
        {children}
      </div>
      {gateState === "open" && (
        <CookieConsentModal onAccept={handleAccept} onDeny={handleDeny} />
      )}
    </>
  );
}

export function CookieConsentGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = getPathnameLocaleOrDefault(pathname);

  useEffect(() => {
    initI18n();
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <CookieConsentGateInner>{children}</CookieConsentGateInner>
    </I18nextProvider>
  );
}

export { CONSENT_STORAGE_KEY };
