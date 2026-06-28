"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/provider";
import { useLocalizedPath } from "@/hooks/use-localized-path";

export default function ToolNotFound() {
  const { t } = useTranslation("common");
  const lp = useLocalizedPath();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="label-caption mb-3 text-blue-500">404</p>
      <h1 className="text-3xl font-bold text-slate-900">{t("notFound.title")}</h1>
      <p className="mt-3 text-slate-500">{t("notFound.description")}</p>
      <Link href={lp("/")} className="btn-primary mt-8">
        {t("notFound.browseTools")}
      </Link>
    </div>
  );
}
