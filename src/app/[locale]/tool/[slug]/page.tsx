import { notFound } from "next/navigation";
import { ToolPageContent } from "@/components/tools/tool-page-content";
import { getRouteLocale } from "@/lib/i18n/server";
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

  if (!tool) return { title: "Tool Not Found" };

  const { title, description } = getToolSeoMetadata(slug as ToolSlug, locale);

  return {
    title,
    description,
    alternates: {
      languages: getToolAlternateLanguages(slug as ToolSlug),
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
