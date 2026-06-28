"use client";

import { useTranslation } from "@/lib/i18n/provider";
import { ArticleCard } from "@/components/content/article-card";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import type { ContentMeta } from "@/lib/content/types";

interface BlogIndexContentProps {
  articles: ContentMeta[];
}

export function BlogIndexContent({ articles }: BlogIndexContentProps) {
  const { t } = useTranslation("common");
  const dir = useLocaleDirection();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14" dir={dir}>
      <header className="mb-12 max-w-2xl">
        <p className="label-caption mb-3 text-blue-500">{t("content.blogCaption")}</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {t("content.blogTitle")}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600">
          {t("content.blogDescription")}
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-lg font-medium text-slate-700">
            {t("content.noArticlesTitle")}
          </p>
          <p className="mt-2 text-sm text-slate-500">{t("content.noArticlesHint")}</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
