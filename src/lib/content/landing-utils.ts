import type { ToolLandingFrontmatter, ToolLandingJson } from "@/lib/content/types";

export function jsonToFrontmatter(json: ToolLandingJson): ToolLandingFrontmatter {
  return {
    title: json.title,
    description: json.subtitle,
    subtitle: json.subtitle,
    heroHighlight: json.heroDescription,
    toolSlug: json.toolSlug,
    relatedArticles: json.relatedArticles,
    publishedAt: json.publishedAt,
  };
}
