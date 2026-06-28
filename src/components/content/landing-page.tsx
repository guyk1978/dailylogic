"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { ArticleCard } from "@/components/content/article-card";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { useLocalizedToolLanding } from "@/hooks/use-localized-tool-landing";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import { useTranslatedTool } from "@/hooks/use-translated-tools";
import type { ContentMeta, ToolLandingFrontmatter } from "@/lib/content/types";
import { jsonToFrontmatter } from "@/lib/content/landing-utils";
import { getToolBySlug, type ToolSlug } from "@/lib/tools-registry";

interface LandingPageProps {
  slug: string;
  mdxFrontmatter?: ToolLandingFrontmatter | null;
  mdxContent?: ReactElement | null;
  relatedArticles: ContentMeta[];
}

export function LandingPage({
  slug,
  mdxFrontmatter,
  mdxContent,
  relatedArticles,
}: LandingPageProps) {
  const { t } = useTranslation("common");
  const dir = useLocaleDirection();
  const localizedJson = useLocalizedToolLanding(slug);
  const resolvedToolSlug = localizedJson?.toolSlug ?? mdxFrontmatter?.toolSlug;
  const translatedTool = useTranslatedTool(
    (resolvedToolSlug ?? "budget-simple") as ToolSlug,
  );

  const frontmatter = localizedJson
    ? jsonToFrontmatter(localizedJson)
    : mdxFrontmatter;

  if (!frontmatter) return null;

  const tool = resolvedToolSlug ? getToolBySlug(resolvedToolSlug) : undefined;
  const toolName = translatedTool?.name ?? tool?.meta.name ?? frontmatter.title;

  const heroText = localizedJson?.heroDescription ?? frontmatter.heroHighlight;
  const subtitle = localizedJson?.subtitle ?? frontmatter.description;
  const benefits = localizedJson?.benefits ?? [];
  const faq = localizedJson?.faq ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14" dir={dir}>
      <Breadcrumbs
        items={[
          { label: t("content.home"), href: "/" },
          { label: t("content.toolsNav"), href: "/tools" },
          { label: frontmatter.title },
        ]}
      />

      <header className="mb-14 max-w-3xl">
        <p className="label-caption mb-3 text-blue-500">{t("landing.toolGuide")}</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {frontmatter.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600">{subtitle}</p>
        {heroText && heroText !== subtitle && (
          <p className="mt-4 text-base leading-relaxed text-slate-500">{heroText}</p>
        )}
        {tool && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/tool/${tool.meta.slug}`} className="btn-primary">
              {t("landing.openTool", { toolName })}
            </Link>
            <Link href="/" className="btn-secondary">
              {t("landing.browseAllTools")}
            </Link>
          </div>
        )}
      </header>

      {benefits.length > 0 && (
        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="label-caption mb-2 text-blue-500">{t("landing.whyUseCaption")}</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {t("landing.whyUseTitle")}
            </h2>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <li
                key={benefit.title}
                className="rounded-2xl bg-white p-6 ring-1 ring-slate-100/80"
              >
                <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {benefit.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {mdxContent && (
        <article className="prose-content mb-14 max-w-3xl" dir={dir}>
          {mdxContent}
        </article>
      )}

      {faq.length > 0 && (
        <section className="mb-14 max-w-3xl">
          <div className="mb-8">
            <p className="label-caption mb-2 text-blue-500">{t("landing.faqCaption")}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{t("landing.faqTitle")}</h2>
          </div>
          <dl className="space-y-4">
            {faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl bg-white p-6 ring-1 ring-slate-100/80"
              >
                <dt className="font-semibold text-slate-900">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-500">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="mt-20 border-t border-slate-100 pt-14">
          <div className="mb-8 max-w-2xl">
            <p className="label-caption mb-2 text-blue-500">{t("landing.useCasesCaption")}</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {t("landing.useCasesTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {t("landing.useCasesDescription", { title: frontmatter.title })}
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((article) => (
              <li key={article.slug}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {tool && (
        <section className="mt-14 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          <h2 className="text-xl font-semibold text-slate-900">{t("landing.readyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            {t("landing.readyDescription", { toolName })}
          </p>
          <Link
            href={`/tool/${tool.meta.slug}`}
            className="btn-primary mt-6 inline-flex"
          >
            {t("landing.launchTool", { toolName })}
          </Link>
        </section>
      )}
    </div>
  );
}
