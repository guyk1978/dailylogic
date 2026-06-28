"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import { setAppLocale, useTranslation } from "@/lib/i18n/provider";
import { switchLocalePath } from "@/lib/i18n/paths";
import {
  localeLabels,
  locales,
} from "@/lib/i18n/settings";
import { useAppLocale } from "@/hooks/use-locale-direction";

export function LanguageSwitcher() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = useAppLocale();
  const currentMeta = localeLabels[current] ?? localeLabels.en;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t("language.label")}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-white hover:text-slate-800 hover:shadow-sm"
      >
        <Globe className="h-3.5 w-3.5 opacity-70" aria-hidden />
        <span>{currentMeta.code}</span>
        <ChevronDown
          className={`h-3 w-3 opacity-60 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language.label")}
          className="absolute end-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-200"
        >
          {locales.map((locale) => {
            const meta = localeLabels[locale];
            const active = locale === current;

            return (
              <li key={locale} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm transition hover:bg-slate-50 ${
                    active ? "font-semibold text-blue-600" : "text-slate-700"
                  }`}
                  onClick={() => {
                    setAppLocale(locale);
                    router.push(switchLocalePath(pathname, locale));
                    setOpen(false);
                  }}
                >
                  <span>{meta.native}</span>
                  <span className="font-mono text-[10px] uppercase text-slate-400">
                    {meta.code}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
