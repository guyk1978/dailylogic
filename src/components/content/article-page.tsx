"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { useTranslation } from "@/lib/i18n/provider";
import { ArticleCard } from "@/components/content/article-card";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { MdxArticleContent } from "@/components/content/mdx-article-content";
import { ToolLinkCard } from "@/components/content/tool-link-card";
import { useLocaleDirection, useLocaleTag } from "@/hooks/use-locale-direction";
import { useLocalizedPath } from "@/hooks/use-localized-path";
import type { ArticleFrontmatter, ContentMeta } from "@/lib/content/types";
import { getToolBySlug } from "@/lib/tools-registry";

interface ArticlePageProps {
  slug: string;
  frontmatter: ArticleFrontmatter;
  content: ReactElement;
  relatedArticles: ContentMeta[];
}

export function ArticlePage({
  slug,
  frontmatter,
  content,
  relatedArticles,
}: ArticlePageProps) {
  const { t } = useTranslation("common");
  const dir = useLocaleDirection();
  const localeTag = useLocaleTag();
  const lp = useLocalizedPath();

  const formattedDate = new Date(frontmatter.publishedAt).toLocaleDateString(
    localeTag,
    { month: "long", day: "numeric", year: "numeric" },
  );

  const relatedTools = (frontmatter.relatedTools ?? [])
    .map((toolSlug) => getToolBySlug(toolSlug)?.meta)
    .filter((meta) => meta !== undefined);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14" dir={dir}>
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs
          items={[
            { label: t("content.home"), href: lp("/") },
            { label: t("content.blog"), href: lp("/blog") },
            { label: frontmatter.title },
          ]}
        />

        <header className="mb-10">
          <p className="label-caption mb-3 text-blue-500">{formattedDate}</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-[2.75rem] sm:leading-tight">
            {frontmatter.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            {frontmatter.description}
          </p>
        </header>

        <MdxArticleContent>{content}</MdxArticleContent>
      </div>

      {relatedTools.length > 0 && (
        <section className="mt-20 border-t border-slate-100 pt-14">
          <div className="mb-8 max-w-2xl">
            <p className="label-caption mb-2 text-blue-500">
              {t("content.relatedToolsCaption")}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {t("content.relatedToolsTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {t("content.relatedToolsDescription")}
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((meta) => (
              <li key={meta.slug} className="h-full">
                <ToolLinkCard meta={meta} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="mt-14 border-t border-slate-100 pt-14">
          <div className="mb-8 max-w-2xl">
            <p className="label-caption mb-2 text-blue-500">
              {t("content.keepReadingCaption")}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {t("content.relatedArticlesTitle")}
            </h2>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles
              .filter((article) => article.slug !== slug)
              .map((article) => (
                <li key={article.slug}>
                  <ArticleCard article={article} />
                </li>
              ))}
          </ul>
        </section>
      )}

      <div className="mx-auto mt-14 max-w-3xl text-center">
        <Link href={lp("/blog")} className="btn-secondary">
          {t("content.backToArticles")}
        </Link>
      </div>
    </div>
  );
}
