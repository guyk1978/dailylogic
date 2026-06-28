import { notFound } from "next/navigation";
import { LandingPage } from "@/components/content/landing-page";
import { getArticleMetaBySlug } from "@/lib/content/loader";
import {
  getLocalizedToolLanding,
  getLocalizedToolLandingSlugs,
} from "@/lib/content/tool-landing-registry";
import { getRouteLocale } from "@/lib/i18n/server";
import { getLandingAlternateLanguages } from "@/lib/seo/tool-seo";
import { locales } from "@/lib/i18n/settings";

interface ToolLandingRouteProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getLocalizedToolLandingSlugs();
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: ToolLandingRouteProps) {
  const { slug } = await params;
  const locale = await getRouteLocale(params);
  const landing = getLocalizedToolLanding(slug, locale);
  if (!landing) return { title: "Tool Not Found" };

  return {
    title: landing.seoTitle ?? landing.title,
    description: landing.seoDescription ?? landing.subtitle,
    alternates: {
      languages: getLandingAlternateLanguages(slug),
    },
  };
}

export default async function ToolLandingRoute({ params }: ToolLandingRouteProps) {
  const { slug } = await params;
  const locale = await getRouteLocale(params);
  const landing = getLocalizedToolLanding(slug, locale);
  if (!landing) notFound();

  const relatedSlugs = landing.relatedArticles ?? [];
  const relatedArticles = relatedSlugs.flatMap((articleSlug) => {
    const meta = getArticleMetaBySlug(articleSlug, locale);
    return meta ? [meta] : [];
  });

  return (
    <LandingPage
      slug={slug}
      relatedArticles={relatedArticles}
    />
  );
}
