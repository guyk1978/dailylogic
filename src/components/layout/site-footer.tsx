"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/provider";
import { useLocalizedPath } from "@/hooks/use-localized-path";
import { INFO_PAGES } from "@/lib/info-pages";

const FOOTER_LINKS = [
  { key: "about", href: INFO_PAGES.about.path },
  { key: "privacy", href: INFO_PAGES.privacy.path },
  { key: "terms", href: INFO_PAGES.terms.path },
  { key: "security", href: INFO_PAGES.security.path },
  { key: "contact", href: INFO_PAGES.contact.path },
] as const;

export function SiteFooter() {
  const { t } = useTranslation(["pages", "common"]);
  const lp = useLocalizedPath();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <nav
          aria-label={t("pages:footer.navLabel")}
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.key}
              href={lp(link.href)}
              className="transition-colors hover:text-blue-600"
            >
              {t(`pages:footer.${link.key}`)}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-center text-xs text-slate-400">{t("common:app.footer")}</p>
        <p className="mt-2 text-center text-xs text-slate-400">
          {t("pages:footer.copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
