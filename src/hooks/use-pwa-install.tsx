"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  registerEarlyInstallPromptListener,
  subscribeToInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/early-install-prompt";

type PwaInstallContextValue = {
  ready: boolean;
  installed: boolean;
  canPrompt: boolean;
  promptInstall: () => Promise<boolean>;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const mediaStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mediaStandalone || iosStandalone;
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    registerEarlyInstallPromptListener();
    setInstalled(isStandaloneDisplay());
    setDeferredPrompt(getDeferredInstallPrompt());
    setReady(true);

    const unsubscribe = subscribeToInstallPrompt((event) => {
      setDeferredPrompt(event);
    });

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      clearDeferredInstallPrompt();
    };

    window.addEventListener("appinstalled", onInstalled);
    return () => {
      unsubscribe();
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const promptEvent = deferredPrompt ?? getDeferredInstallPrompt();
    if (!promptEvent) return false;

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setDeferredPrompt(null);
    clearDeferredInstallPrompt();
    if (choice.outcome === "accepted") {
      setInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const value = useMemo<PwaInstallContextValue>(
    () => ({
      ready,
      installed,
      canPrompt: Boolean(deferredPrompt) && !installed,
      promptInstall,
    }),
    [deferredPrompt, installed, ready, promptInstall],
  );

  return (
    <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>
  );
}

export function usePwaInstall(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }
  return ctx;
}
