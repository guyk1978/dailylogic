"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/provider";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import { ICON_STROKE_WIDTH } from "@/lib/tool-icons";
import type { ToolSlug } from "@/lib/tools-registry";

interface ShareToolButtonProps {
  slug: ToolSlug;
  name: string;
  description: string;
}

function currentPageUrl(): string {
  if (typeof window === "undefined") return "https://dailylogic.app";
  return window.location.href;
}

function currentOgImageUrl(): string {
  if (typeof window === "undefined") return "";
  const { origin, pathname } = window.location;
  return `${origin}${pathname.replace(/\/$/, "")}/opengraph-image`;
}

export function ShareToolButton({ slug, name, description }: ShareToolButtonProps) {
  const { t } = useTranslation("common");
  const dir = useLocaleDirection();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shareText = `${name} — ${description}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentPageUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore clipboard errors.
    }
  };

  const shareNative = async () => {
    const url = currentPageUrl();
    const title = name;
    const text = shareText;

    try {
      const img = currentOgImageUrl();
      if (img && typeof navigator.canShare === "function") {
        const response = await fetch(img);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], `${slug}-share.png`, {
            type: blob.type || "image/png",
          });
          if (navigator.canShare({ files: [file], title, text, url })) {
            await navigator.share({ files: [file], title, text, url });
            setOpen(false);
            return;
          }
        }
      }
    } catch {
      // Fall through to URL-only share.
    }

    try {
      await navigator.share({ title, text, url });
      setOpen(false);
    } catch {
      // User cancelled or share failed.
    }
  };

  const encodedUrl = encodeURIComponent(
    typeof window !== "undefined" ? window.location.href : "",
  );
  const encodedText = encodeURIComponent(shareText);

  const networks = [
    {
      key: "whatsapp",
      label: t("share.whatsapp"),
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentPageUrl()}`)}`,
    },
    {
      key: "telegram",
      label: t("share.telegram"),
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: "facebook",
      label: t("share.facebook"),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "x",
      label: t("share.x"),
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
  ] as const;

  return (
    <div ref={rootRef} className="relative" dir={dir}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2.5 text-sm font-medium text-blue-600 transition duration-200 hover:bg-blue-100 hover:text-blue-700"
        aria-label={t("share.button")}
        aria-expanded={open}
      >
        <Share2 className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
        <span>{t("share.button")}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute end-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl bg-white p-2 shadow-soft ring-1 ring-slate-100"
            role="menu"
          >
            <p className="px-2.5 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t("share.menuTitle")}
            </p>

            {canNativeShare && (
              <button
                type="button"
                role="menuitem"
                onClick={() => void shareNative()}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Share2 className="h-4 w-4 text-blue-500" strokeWidth={ICON_STROKE_WIDTH} />
                {t("share.native")}
              </button>
            )}

            <button
              type="button"
              role="menuitem"
              onClick={() => void copyLink()}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" strokeWidth={ICON_STROKE_WIDTH} />
              ) : (
                <Copy className="h-4 w-4 text-slate-400" strokeWidth={ICON_STROKE_WIDTH} />
              )}
              {copied ? t("share.copied") : t("share.copy")}
            </button>

            <div className="my-1 h-px bg-slate-100" />

            {networks.map((network) => (
              <a
                key={network.key}
                role="menuitem"
                href={network.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex w-full items-center rounded-xl px-2.5 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                {network.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
