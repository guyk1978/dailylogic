import { notFound } from "next/navigation";
import { LandingPage } from "@/components/content/landing-page";
import {
  getArticleMetaBySlug,
  getContentSlugs,
  getToolLandingPage,
} from "@/lib/content/loader";

interface ToolLandingRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getContentSlugs("tools").map((slug) => ({ slug }));
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
  const page = await getToolLandingPage(slug);
  if (!page) notFound();

  const relatedArticles = (page.frontmatter.relatedArticles ?? [])
    .map((articleSlug) => getArticleMetaBySlug(articleSlug))
    .filter((article) => article !== null);

  return (
    <LandingPage
      slug={slug}
      mdxFrontmatter={page.format === "mdx" ? page.frontmatter : null}
      mdxContent={page.format === "mdx" ? page.content : null}
      relatedArticles={relatedArticles}
    />
  );
}
