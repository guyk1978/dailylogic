"use client";

import { useEffect } from "react";
import { registerEarlyInstallPromptListener } from "@/lib/pwa/early-install-prompt";

export function ServiceWorkerRegister() {
  useEffect(() => {
    registerEarlyInstallPromptListener();

    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Ignore registration errors (e.g. unsupported contexts).
    });
  }, []);

  return null;
}
