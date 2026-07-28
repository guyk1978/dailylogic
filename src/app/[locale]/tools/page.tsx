import { ToolsIndexContent } from "@/components/content/tools-index-content";
import { getAllArticleMetaFromRegistry } from "@/lib/content/article-meta-registry";
import { localeResources } from "@/lib/i18n/resources";
import { getRouteLocale } from "@/lib/i18n/server";

export const runtime = "edge";

interface ToolsIndexPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ToolsIndexPageProps) {
  const locale = await getRouteLocale(params);
  const { content, landing } = localeResources[locale].common;

  return {
    title: content.toolsNav,
    description: landing.toolsIndexDescription,
  };
}

export default async function ToolsIndexPage({ params }: ToolsIndexPageProps) {
  const locale = await getRouteLocale(params);
  const articles = getAllArticleMetaFromRegistry(locale).slice(0, 3);

  return <ToolsIndexContent articles={articles} />;
}
