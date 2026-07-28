import { BlogIndexContent } from "@/components/content/blog-index-content";
import { getAllArticleMetaFromRegistry } from "@/lib/content/article-meta-registry";
import { localeResources } from "@/lib/i18n/resources";
import { getRouteLocale } from "@/lib/i18n/server";

export const runtime = "edge";

interface BlogIndexPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogIndexPageProps) {
  const locale = await getRouteLocale(params);
  const { content } = localeResources[locale].common;

  return {
    title: content.blog,
    description: content.blogDescription,
  };
}

export default async function BlogIndexPage({ params }: BlogIndexPageProps) {
  const locale = await getRouteLocale(params);
  const articles = getAllArticleMetaFromRegistry(locale);

  return <BlogIndexContent articles={articles} />;
}
