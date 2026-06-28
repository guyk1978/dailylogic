import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/content/article-page";
import {
  getArticleMetaBySlug,
  getArticlePage,
  getContentSlugs,
} from "@/lib/content/loader";

interface BlogPostRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getContentSlugs("articles").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const page = await getArticlePage(slug);
  if (!page) return { title: "Article Not Found" };

  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  };
}

export default async function BlogPostRoute({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const page = await getArticlePage(slug);
  if (!page) notFound();

  const relatedArticles = (page.frontmatter.relatedArticles ?? [])
    .map((articleSlug) => getArticleMetaBySlug(articleSlug))
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
