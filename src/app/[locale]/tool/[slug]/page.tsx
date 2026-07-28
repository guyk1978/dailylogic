import { notFound } from "next/navigation";
import { ToolPageContent } from "@/components/tools/tool-page-content";
import { localeResources } from "@/lib/i18n/resources";
import { getRouteLocale } from "@/lib/i18n/server";
import { absoluteUrl } from "@/lib/seo/site";
import { toolOgImagePath } from "@/lib/seo/tool-og";
import {
  getToolAlternateLanguages,
  getToolSeoMetadata,
} from "@/lib/seo/tool-seo";
import { locales } from "@/lib/i18n/settings";
import { getAllSlugs, getToolBySlug, type ToolSlug } from "@/lib/tools-registry";

interface ToolPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: ToolPageProps) {
  const { slug } = await params;
  const locale = await getRouteLocale(params);
  const tool = getToolBySlug(slug);

  if (!tool) {
    return { title: localeResources[locale].common.notFound.toolMetaTitle };
  }

  const { title, description } = getToolSeoMetadata(slug as ToolSlug, locale);
  const pagePath = `/${locale}/tool/${slug}`;
  const ogImage = absoluteUrl(toolOgImagePath(locale, slug));

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(pagePath),
      languages: getToolAlternateLanguages(slug as ToolSlug),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(pagePath),
      title,
      description,
      siteName: localeResources[locale].common.app.name,
      locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  await getRouteLocale(params);
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  return <ToolPageContent slug={slug as ToolSlug} />;
}
