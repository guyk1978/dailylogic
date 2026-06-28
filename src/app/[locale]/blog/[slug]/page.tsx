import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/content/article-page";
import {
  getArticleMetaBySlug,
  getArticlePage,
  getContentSlugs,
} from "@/lib/content/loader";
import { getRouteLocale } from "@/lib/i18n/server";
import { locales } from "@/lib/i18n/settings";

interface BlogPostRouteProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getContentSlugs("articles");
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const locale = await getRouteLocale(params);
  const page = await getArticlePage(slug, locale);
  if (!page) return { title: "Article Not Found" };

  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    alternates: {
      languages: Object.fromEntries(
        locales.map((lng) => [lng, `/${lng}/blog/${slug}`]),
      ),
    },
  };
}

export default async function BlogPostRoute({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const locale = await getRouteLocale(params);
  const page = await getArticlePage(slug, locale);
  if (!page) notFound();

  const relatedArticles = (page.frontmatter.relatedArticles ?? [])
    .map((articleSlug) => getArticleMetaBySlug(articleSlug, locale))
    .filter((article) => article !== null);

  return (
    <ArticlePage
      slug={page.slug}
      frontmatter={page.frontmatter}
      content={page.content}
      relatedArticles={relatedArticles}
    />
  );
}
