/**
 * Capture `beforeinstallprompt` as early as possible.
 * React may mount after Chrome fires the event once — without this, the CTA never gets a prompt.
 */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const BIP_EVENT = "dailylogic:beforeinstallprompt";

declare global {
  interface Window {
    __dlDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
    __dlBipBound?: boolean;
  }
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

function stash(event: BeforeInstallPromptEvent) {
  event.preventDefault();
  deferredPrompt = event;
  if (typeof window !== "undefined") {
    window.__dlDeferredInstallPrompt = event;
    window.dispatchEvent(new CustomEvent(BIP_EVENT, { detail: event }));
  }
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  if (deferredPrompt) return deferredPrompt;
  if (typeof window !== "undefined" && window.__dlDeferredInstallPrompt) {
    deferredPrompt = window.__dlDeferredInstallPrompt;
    return deferredPrompt;
  }
  return null;
}

export function clearDeferredInstallPrompt(): void {
  deferredPrompt = null;
  if (typeof window !== "undefined") {
    window.__dlDeferredInstallPrompt = null;
  }
}

export function subscribeToInstallPrompt(
  listener: (event: BeforeInstallPromptEvent) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<BeforeInstallPromptEvent>).detail;
    if (detail) listener(detail);
  };

  window.addEventListener(BIP_EVENT, onCustom);

  const existing = getDeferredInstallPrompt();
  if (existing) {
    listener(existing);
  }

  return () => {
    window.removeEventListener(BIP_EVENT, onCustom);
  };
}

export function registerEarlyInstallPromptListener(): void {
  if (typeof window === "undefined") return;
  if (window.__dlBipBound) {
    // Inline head script may already have stashed an event.
    if (window.__dlDeferredInstallPrompt) {
      deferredPrompt = window.__dlDeferredInstallPrompt;
    }
    return;
  }
  window.__dlBipBound = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    stash(event as BeforeInstallPromptEvent);
  });

  window.addEventListener("appinstalled", () => {
    clearDeferredInstallPrompt();
  });

  if (window.__dlDeferredInstallPrompt) {
    deferredPrompt = window.__dlDeferredInstallPrompt;
  }
}

// Bind immediately when this module is first imported on the client.
registerEarlyInstallPromptListener();
