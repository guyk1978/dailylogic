"use client";

import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/provider";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
} from "@/lib/pwa/early-install-prompt";
import { ICON_STROKE_WIDTH } from "@/lib/tool-icons";

interface InstallAppButtonProps {
  /** Compact header control vs home CTA banner */
  variant?: "header" | "banner";
}

export function InstallAppButton({ variant = "header" }: InstallAppButtonProps) {
  const { t } = useTranslation("common");
  const { ready, installed, promptInstall } = usePwaInstall();

  if (!ready || installed) return null;

  const label = t("install.button");

  // Call prompt() synchronously from the click gesture (required by Chrome).
  const handleClick = () => {
    const event = getDeferredInstallPrompt();
    if (!event) {
      // Fall back to the hook path (may still have React-stashed event).
      void promptInstall();
      return;
    }

    void event
      .prompt()
      .then(() => event.userChoice)
      .then((choice) => {
        clearDeferredInstallPrompt();
        if (choice.outcome === "accepted") {
          window.dispatchEvent(new Event("appinstalled"));
        }
      })
      .catch(() => {
        clearDeferredInstallPrompt();
      });
  };

  const actionButton =
    variant === "header" ? (
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-600 transition duration-200 hover:bg-blue-100 hover:text-blue-700"
        aria-label={label}
      >
        <Download className="h-4 w-4 shrink-0" strokeWidth={ICON_STROKE_WIDTH} />
        <span className="hidden sm:inline">{label}</span>
      </motion.button>
    ) : (
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="btn-primary gap-2 px-5 py-3"
      >
        <Download className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
        {label}
      </motion.button>
    );

  if (variant === "banner") {
    return (
      <motion.section
        className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/50 p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 14% 20%, rgba(59,130,246,0.10), transparent 38%), radial-gradient(circle at 90% 75%, rgba(16,185,129,0.08), transparent 34%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <p className="label-caption text-blue-500">{t("install.caption")}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {t("install.title")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("install.description")}
            </p>
          </div>
          <div className="shrink-0">{actionButton}</div>
        </div>
      </motion.section>
    );
  }

  return actionButton;
}
