import { ToolsIndexContent } from "@/components/content/tools-index-content";
import { getAllArticleMeta } from "@/lib/content/loader";

export const metadata = {
  title: "Tools",
  description:
    "Guides and landing pages for every DailyLogic tool — budgeting, cooking, shopping, and more.",
};

export default function ToolsIndexPage() {
  const articles = getAllArticleMeta().slice(0, 3);

  return <ToolsIndexContent articles={articles} />;
}
