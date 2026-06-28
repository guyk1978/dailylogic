import { ToolsIndexContent } from "@/components/content/tools-index-content";
import { getAllArticleMeta } from "@/lib/content/loader";
import { getRouteLocale } from "@/lib/i18n/server";

export const metadata = {
  title: "Tools",
  description:
    "Guides and landing pages for every DailyLogic tool — budgeting, cooking, shopping, and more.",
};

interface ToolsIndexPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ToolsIndexPage({ params }: ToolsIndexPageProps) {
  const locale = await getRouteLocale(params);
  const articles = getAllArticleMeta(locale).slice(0, 3);

  return <ToolsIndexContent articles={articles} />;
}
