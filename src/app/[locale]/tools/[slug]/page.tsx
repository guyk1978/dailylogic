import { notFound } from "next/navigation";
import { LandingPage } from "@/components/content/landing-page";
import {
  getArticleMetaBySlug,
  getContentSlugs,
  getToolLandingPage,
} from "@/lib/content/loader";
import { getRouteLocale } from "@/lib/i18n/server";
import { locales } from "@/lib/i18n/settings";

interface ToolLandingRouteProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getContentSlugs("tools");
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: ToolLandingRouteProps) {
  const { slug } = await params;
  const page = await getToolLandingPage(slug);
  if (!page) return { title: "Tool Not Found" };

  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  };
}

export default async function ToolLandingRoute({ params }: ToolLandingRouteProps) {
  const { slug } = await params;
  const locale = await getRouteLocale(params);
  const page = await getToolLandingPage(slug);
  if (!page) notFound();

  const relatedSlugs = page.frontmatter.relatedArticles ?? [];
  const relatedArticles = relatedSlugs.flatMap((articleSlug) => {
    const meta = getArticleMetaBySlug(articleSlug, locale);
    return meta ? [meta] : [];
  });

  return (
    <LandingPage
      slug={slug}
      mdxFrontmatter={page.format === "mdx" ? page.frontmatter : null}
      mdxContent={page.format === "mdx" ? page.content : null}
      relatedArticles={relatedArticles}
    />
  );
}
