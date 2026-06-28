"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/provider";
import { ArticleCard } from "@/components/content/article-card";
import { useAppLocale, useLocaleDirection } from "@/hooks/use-locale-direction";
import { useLocalizedPath } from "@/hooks/use-localized-path";
import { getAllLocalizedToolLandingMeta } from "@/lib/content/tool-landing-registry";
import type { ContentMeta } from "@/lib/content/types";

interface ToolsIndexContentProps {
  articles: ContentMeta[];
}

export function ToolsIndexContent({ articles }: ToolsIndexContentProps) {
  const { t } = useTranslation("common");
  const locale = useAppLocale();
  const dir = useLocaleDirection();
  const lp = useLocalizedPath();

  const toolPages = useMemo(
    () => getAllLocalizedToolLandingMeta(locale),
    [locale],
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14" dir={dir}>
      <header className="mb-12 max-w-2xl">
        <p className="label-caption mb-3 text-blue-500">{t("landing.toolsIndexCaption")}</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {t("landing.toolsIndexTitle")}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600">
          {t("landing.toolsIndexDescription")}
        </p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {toolPages.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={lp(`/tools/${tool.slug}`)}
              prefetch
              className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-100/80 transition duration-300 hover:ring-blue-100 hover:shadow-soft"
            >
              <h2 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                {tool.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                {tool.description}
              </p>
              <span className="mt-4 text-sm font-medium text-blue-600">
                {t("landing.viewGuide")}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {articles.length > 0 && (
        <section className="mt-20 border-t border-slate-100 pt-14">
          <div className="mb-8 max-w-2xl">
            <p className="label-caption mb-2 text-blue-500">{t("landing.fromBlogCaption")}</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {t("landing.fromBlogTitle")}
            </h2>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.slug}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href={lp("/blog")} className="btn-secondary">
              {t("landing.viewAllArticles")}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
