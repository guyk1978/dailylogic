"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useLocaleTag } from "@/hooks/use-locale-direction";
import type { ContentMeta } from "@/lib/content/types";

interface ArticleCardProps {
  article: ContentMeta;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { t } = useTranslation("common");
  const localeTag = useLocaleTag();

  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(localeTag, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/blog/${article.slug}`}
      prefetch
      className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-100/80 transition duration-300 hover:ring-blue-100 hover:shadow-soft"
    >
      {date && <p className="label-caption mb-3 text-blue-500">{date}</p>}
      <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
        {article.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
        {article.description}
      </p>
      <span className="mt-4 text-sm font-medium text-blue-600">
        {t("content.readArticle")}
      </span>
    </Link>
  );
}
