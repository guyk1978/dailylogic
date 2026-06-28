import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { getMdxComponents } from "@/lib/content/mdx-components";
import { jsonToFrontmatter } from "@/lib/content/landing-utils";
import { getLocalizedToolLandingSlugs } from "@/lib/content/tool-landing-registry";
import type {
  ArticleFrontmatter,
  ArticlePageData,
  ContentMeta,
  ToolLandingFrontmatter,
  ToolLandingJson,
  ToolLandingPageData,
} from "@/lib/content/types";
import { defaultLocale, type AppLocale } from "@/lib/i18n/settings";

const contentRoot = path.join(process.cwd(), "content");

type ContentKind = "tools" | "articles";

function getLegacyToolsDir() {
  return path.join(contentRoot, "tools");
}

function getLocaleToolsDir(locale: AppLocale = defaultLocale) {
  return path.join(contentRoot, locale, "tools");
}

function getArticlesDir() {
  return path.join(contentRoot, "articles");
}

function getMdxFilePath(kind: ContentKind, slug: string) {
  if (kind === "articles") {
    return path.join(getArticlesDir(), `${slug}.mdx`);
  }
  return path.join(getLegacyToolsDir(), `${slug}.mdx`);
}

function getToolJsonFilePath(slug: string, locale: AppLocale = defaultLocale) {
  const localized = path.join(getLocaleToolsDir(locale), `${slug}.json`);
  if (fs.existsSync(localized)) return localized;

  const legacy = path.join(getLegacyToolsDir(), `${slug}.json`);
  if (fs.existsSync(legacy)) return legacy;

  return localized;
}

export function getContentSlugs(kind: ContentKind): string[] {
  const slugs = new Set<string>();

  if (kind === "tools") {
    for (const slug of getLocalizedToolLandingSlugs()) {
      slugs.add(slug);
    }

    const legacyDir = getLegacyToolsDir();
    if (fs.existsSync(legacyDir)) {
      for (const file of fs.readdirSync(legacyDir)) {
        if (file.endsWith(".mdx")) slugs.add(file.replace(/\.mdx$/, ""));
      }
    }
    return [...slugs];
  }

  const dir = getArticlesDir();
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function readFrontmatter<T>(kind: ContentKind, slug: string): T | null {
  const filePath = getMdxFilePath(kind, slug);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf8");
  const { data } = matter(source);
  return data as T;
}

function readToolLandingJson(
  slug: string,
  locale: AppLocale = defaultLocale,
): ToolLandingJson | null {
  const filePath = getToolJsonFilePath(slug, locale);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as ToolLandingJson;
}

function readToolLandingMeta(slug: string): ContentMeta | null {
  const json = readToolLandingJson(slug);
  if (json) {
    return {
      slug,
      title: json.title,
      description: json.subtitle,
      publishedAt: json.publishedAt,
    };
  }

  const data = readFrontmatter<ToolLandingFrontmatter>("tools", slug);
  if (!data) return null;

  return {
    slug,
    title: data.title,
    description: data.description,
    publishedAt: data.publishedAt,
  };
}

export function getAllToolLandingMeta(): ContentMeta[] {
  return getContentSlugs("tools").flatMap((slug) => {
    const meta = readToolLandingMeta(slug);
    return meta ? [meta] : [];
  });
}

export function getAllArticleMeta(): ContentMeta[] {
  return getContentSlugs("articles")
    .flatMap((slug) => {
      const data = readFrontmatter<ArticleFrontmatter>("articles", slug);
      if (!data) return [];

      return [
        {
          slug,
          title: data.title,
          description: data.description,
          publishedAt: data.publishedAt,
        },
      ];
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? 0).getTime() -
        new Date(a.publishedAt ?? 0).getTime(),
    );
}

export async function getToolLandingPage(
  slug: string,
): Promise<ToolLandingPageData | null> {
  const json = readToolLandingJson(slug);
  if (json) {
    return {
      slug,
      format: "json",
      frontmatter: jsonToFrontmatter(json),
      content: null,
      json,
    };
  }

  const filePath = getMdxFilePath("tools", slug);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf8");
  const { content, frontmatter } = await compileMDX<ToolLandingFrontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: getMdxComponents(),
  });

  return {
    slug,
    format: "mdx",
    frontmatter,
    content,
    json: null,
  };
}

export async function getArticlePage(
  slug: string,
): Promise<ArticlePageData | null> {
  const filePath = getMdxFilePath("articles", slug);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf8");
  const { content, frontmatter } = await compileMDX<ArticleFrontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: getMdxComponents(),
  });

  return { slug, frontmatter, content };
}

export function getArticleMetaBySlug(slug: string): ContentMeta | null {
  const data = readFrontmatter<ArticleFrontmatter>("articles", slug);
  if (!data) return null;

  return {
    slug,
    title: data.title,
    description: data.description,
    publishedAt: data.publishedAt,
  };
}
