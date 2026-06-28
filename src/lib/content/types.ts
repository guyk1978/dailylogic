import type { ReactElement } from "react";
import type { ToolSlug } from "@/lib/tools-registry";

export interface ToolLandingBenefit {
  title: string;
  description: string;
}

export interface ToolLandingFaq {
  question: string;
  answer: string;
}

export interface ToolLandingContentSection {
  heading: string;
  paragraphs: string[];
}

export interface ToolLandingJson {
  title: string;
  subtitle: string;
  heroDescription: string;
  toolSlug: ToolSlug;
  seoTitle?: string;
  seoDescription?: string;
  schemaType?: "WebApplication" | "SoftwareApplication";
  applicationCategory?: string;
  sections?: ToolLandingContentSection[];
  relatedArticles?: string[];
  publishedAt?: string;
  benefits: ToolLandingBenefit[];
  faq: ToolLandingFaq[];
}

export interface ToolLandingFrontmatter {
  title: string;
  description: string;
  toolSlug: ToolSlug;
  heroHighlight?: string;
  subtitle?: string;
  relatedArticles?: string[];
  publishedAt?: string;
}

export interface ArticleFrontmatter {
  title: string;
  description: string;
  publishedAt: string;
  relatedTools?: ToolSlug[];
  relatedArticles?: string[];
}

export interface ContentMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt?: string;
}

export interface ToolLandingPageData {
  slug: string;
  format: "mdx" | "json";
  frontmatter: ToolLandingFrontmatter;
  content: ReactElement | null;
  json: ToolLandingJson | null;
}

export interface ArticlePageData {
  slug: string;
  frontmatter: ArticleFrontmatter;
  content: ReactElement;
}
