import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { getArticleSlugsFromRegistry } from "@/lib/content/article-meta-registry";
import {
  getLocalizedToolLanding,
  getLocalizedToolLandingSlugs,
} from "@/lib/content/tool-landing-registry";
import { absoluteUrl } from "@/lib/seo/site";
import { defaultLocale, locales, type AppLocale } from "@/lib/i18n/settings";
import { getAllSlugs } from "@/lib/tools-registry";
import { INFO_PAGE_PATHS } from "@/lib/info-pages";

const contentRoot = path.join(process.cwd(), "content");

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function localizedPath(locale: AppLocale, routePath: string): string {
  if (routePath === "/") return `/${locale}`;
  return `/${locale}${routePath.startsWith("/") ? routePath : `/${routePath}`}`;
}

function parseLastModified(value?: string): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** Collect tool landing slugs from `content/{locale}/tools/` and legacy `content/tools/`. */
export function getToolLandingSlugsFromContent(): string[] {
  const slugs = new Set<string>(getLocalizedToolLandingSlugs());

  for (const locale of locales) {
    const dir = path.join(contentRoot, locale, "tools");
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".json")) {
        slugs.add(file.replace(/\.json$/, ""));
      }
    }
  }

  const legacyDir = path.join(contentRoot, "tools");
  if (fs.existsSync(legacyDir)) {
    for (const file of fs.readdirSync(legacyDir)) {
      if (file.endsWith(".mdx") || file.endsWith(".json")) {
        slugs.add(file.replace(/\.(mdx|json)$/, ""));
      }
    }
  }

  return [...slugs].sort();
}

function entry(
  locale: AppLocale,
  routePath: string,
  options: {
    lastModified?: Date;
    changeFrequency?: ChangeFrequency;
    priority?: number;
  } = {},
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(localizedPath(locale, routePath)),
    lastModified: options.lastModified ?? new Date(),
    changeFrequency: options.changeFrequency ?? "weekly",
    priority: options.priority,
  };
}

export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const toolLandingSlugs = getToolLandingSlugsFromContent();
  const interactiveToolSlugs = getAllSlugs();
  const articleSlugs = getArticleSlugsFromRegistry();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: ChangeFrequency;
    priority: number;
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/tools", changeFrequency: "weekly", priority: 0.9 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    ...INFO_PAGE_PATHS.map((path) => ({
      path,
      changeFrequency: "yearly" as ChangeFrequency,
      priority: 0.5,
    })),
  ];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push(
        entry(locale, route.path, {
          changeFrequency: route.changeFrequency,
          priority: locale === defaultLocale ? route.priority : route.priority * 0.95,
        }),
      );
    }

    for (const slug of toolLandingSlugs) {
      const landing = getLocalizedToolLanding(slug, locale);
      if (!landing) continue;

      entries.push(
        entry(locale, `/tools/${slug}`, {
          lastModified: parseLastModified(landing.publishedAt),
          changeFrequency: "monthly",
          priority: locale === defaultLocale ? 0.85 : 0.8,
        }),
      );
    }

    for (const slug of interactiveToolSlugs) {
      const landingSlug = toolLandingSlugs.find((landingSlug) => {
        const landing = getLocalizedToolLanding(landingSlug, locale);
        return landing?.toolSlug === slug;
      });
      const landing = landingSlug
        ? getLocalizedToolLanding(landingSlug, locale)
        : null;

      entries.push(
        entry(locale, `/tool/${slug}`, {
          lastModified: parseLastModified(landing?.publishedAt),
          changeFrequency: "monthly",
          priority: locale === defaultLocale ? 0.9 : 0.85,
        }),
      );
    }

    for (const slug of articleSlugs) {
      entries.push(
        entry(locale, `/blog/${slug}`, {
          changeFrequency: "monthly",
          priority: locale === defaultLocale ? 0.7 : 0.65,
        }),
      );
    }
  }

  return entries;
}
