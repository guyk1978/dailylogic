"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import { useTranslation } from "@/lib/i18n/provider";

export interface RecipeShareGroup {
  category: string;
  label: string;
  lines: string[];
}

interface RecipeShareModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  groups: RecipeShareGroup[];
  copyText: string;
  copyLabel: string;
  copiedLabel: string;
  closeLabel: string;
}

function FloralCorner({
  className,
  mirror = false,
}: {
  className?: string;
  mirror?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M18 102 C28 78, 48 62, 72 52"
          stroke="#7BA88A"
          strokeWidth="2.2"
          opacity="0.85"
        />
        <path
          d="M42 88 C50 74, 62 66, 78 60"
          stroke="#9BC4A8"
          strokeWidth="1.6"
          opacity="0.7"
        />
        <ellipse
          cx="34"
          cy="70"
          rx="11"
          ry="6"
          fill="#A8D4B5"
          opacity="0.55"
          transform="rotate(-35 34 70)"
        />
        <ellipse
          cx="56"
          cy="58"
          rx="10"
          ry="5.5"
          fill="#8FBF9E"
          opacity="0.5"
          transform="rotate(20 56 58)"
        />
        <circle cx="78" cy="48" r="7" fill="#F2B8C6" opacity="0.9" />
        <circle cx="72" cy="42" r="5.5" fill="#E89AAD" opacity="0.75" />
        <circle cx="84" cy="42" r="5.5" fill="#E89AAD" opacity="0.75" />
        <circle cx="72" cy="54" r="5.5" fill="#E89AAD" opacity="0.75" />
        <circle cx="84" cy="54" r="5.5" fill="#E89AAD" opacity="0.75" />
        <circle cx="78" cy="48" r="3.2" fill="#F7E1A8" />
        <circle cx="96" cy="62" r="4.5" fill="#F6C1CE" opacity="0.7" />
        <circle cx="58" cy="36" r="3.8" fill="#F6C1CE" opacity="0.65" />
      </g>
    </svg>
  );
}

export function RecipeShareModal({
  open,
  onClose,
  title,
  subtitle,
  groups,
  copyText,
  copyLabel,
  copiedLabel,
  closeLabel,
}: RecipeShareModalProps) {
  const { t } = useTranslation("common");
  const dir = useLocaleDirection();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — fail silently.
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]"
            aria-label={closeLabel}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex max-h-[min(88vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] shadow-2xl ring-1 ring-rose-100/80"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <div
              className="relative overflow-hidden px-6 pb-4 pt-5 sm:px-8 sm:pt-6"
              style={{
                background:
                  "linear-gradient(145deg, #fff8f6 0%, #f4faf6 48%, #fffef9 100%)",
              }}
            >
              <FloralCorner className="pointer-events-none absolute -start-3 -top-2 h-28 w-28 opacity-90" />
              <FloralCorner
                mirror
                className="pointer-events-none absolute -end-3 -top-2 h-28 w-28 opacity-90"
              />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 pe-2 ps-1 pt-1">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-[#7BA88A] uppercase rtl:tracking-normal rtl:normal-case">
                    {t("app.name")}
                  </p>
                  <h2
                    id={titleId}
                    className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
                  >
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-full bg-white/80 p-2 text-slate-500 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-white hover:text-slate-800"
                  aria-label={closeLabel}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div
                className="mt-4 h-px w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #e8b4c0 20%, #9bc4a8 50%, #e8b4c0 80%, transparent)",
                }}
                aria-hidden
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-white px-6 py-5 sm:px-8">
              <div className="space-y-5">
                {groups.map((group) => (
                  <div key={group.category}>
                    <p className="text-[11px] font-bold tracking-widest text-[#7BA88A] uppercase rtl:tracking-wide rtl:normal-case">
                      {group.label}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {group.lines.map((line, index) => (
                        <li
                          key={`${group.category}-${index}`}
                          className="flex items-start gap-2 text-sm leading-relaxed text-slate-700"
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E89AAD]"
                            aria-hidden
                          />
                          <span className="font-mono">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative border-t border-rose-100/70 px-6 py-4 sm:px-8"
              style={{
                background:
                  "linear-gradient(180deg, #ffffff 0%, #fbf7f5 100%)",
              }}
            >
              <FloralCorner className="pointer-events-none absolute -bottom-6 -start-4 h-20 w-20 rotate-180 opacity-40" />
              <div className="relative flex justify-center">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-800 hover:shadow-sm hover:ring-1 hover:ring-slate-200/80"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                      <span className="text-emerald-700">{copiedLabel}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 opacity-70" aria-hidden />
                      <span>{copyLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
