import { BlogIndexContent } from "@/components/content/blog-index-content";
import { getAllArticleMeta } from "@/lib/content/loader";
import { getRouteLocale } from "@/lib/i18n/server";

export const metadata = {
  title: "Blog",
  description:
    "Practical articles on budgeting, cooking, shopping, and everyday decisions.",
};

interface BlogIndexPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogIndexPage({ params }: BlogIndexPageProps) {
  const locale = await getRouteLocale(params);
  const articles = getAllArticleMeta(locale);

  return <BlogIndexContent articles={articles} />;
}
