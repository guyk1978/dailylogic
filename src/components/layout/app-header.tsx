"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function AppHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t } = useTranslation("common");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Link
            href="/"
            prefetch
            className="group flex min-w-0 items-center gap-3 transition duration-200 hover:opacity-90"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white shadow-sm transition duration-200 group-hover:bg-blue-600 group-hover:shadow-md">
              DL
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {t("app.name")}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {t("app.tagline")}
              </span>
            </span>
          </Link>
        </motion.div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            <Link
              href="/tools"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith("/tools")
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("content.toolsNav")}
            </Link>
            <Link
              href="/blog"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith("/blog")
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("content.blog")}
            </Link>
          </nav>

          <LanguageSwitcher />

          {!isHome && (
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/"
                prefetch
                className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition duration-200 hover:bg-blue-100 hover:text-blue-700"
              >
                ← {t("header.backHome")}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
