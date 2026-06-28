import { notFound } from "next/navigation";
import { ToolPageContent } from "@/components/tools/tool-page-content";
import { getAllSlugs, getToolBySlug, type ToolSlug } from "@/lib/tools-registry";
import { getRouteLocale } from "@/lib/i18n/server";
import { locales } from "@/lib/i18n/settings";

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
  const tool = getToolBySlug(slug);

  if (!tool) return { title: "Tool Not Found" };

  return {
    title: tool.meta.name,
    description: tool.meta.description,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  await getRouteLocale(params);
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  return <ToolPageContent slug={slug as ToolSlug} />;
}
