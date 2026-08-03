import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import {
  getArticleMetaBySlugFromRegistry,
  getArticleSlugsFromRegistry,
} from "@/lib/content/article-meta-registry";
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

function readJsonPublishedAt(filePath: string): string | undefined {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as { publishedAt?: string };
    return typeof data.publishedAt === "string" ? data.publishedAt : undefined;
  } catch {
    return undefined;
  }
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

/**
 * Collect article slugs from MDX on disk (all locales) merged with the
 * generated article-meta registry so new posts appear even before a rebuild
 * refresh, and registry-only entries are not dropped.
 */
export function getArticleSlugsFromContent(): string[] {
  const slugs = new Set<string>(getArticleSlugsFromRegistry());

  for (const locale of locales) {
    const dir = path.join(contentRoot, "articles", locale);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".mdx")) {
        slugs.add(file.replace(/\.mdx$/, ""));
      }
    }
  }

  return [...slugs].sort();
}

function toolLandingExists(slug: string, locale: AppLocale): boolean {
  if (getLocalizedToolLanding(slug, locale)) return true;

  const localized = path.join(contentRoot, locale, "tools", `${slug}.json`);
  if (fs.existsSync(localized)) return true;

  const legacy = path.join(contentRoot, "tools", `${slug}.json`);
  if (fs.existsSync(legacy)) return true;

  const legacyMdx = path.join(contentRoot, "tools", `${slug}.mdx`);
  return fs.existsSync(legacyMdx);
}

function toolLandingLastModified(slug: string, locale: AppLocale): Date {
  const landing = getLocalizedToolLanding(slug, locale);
  if (landing?.publishedAt) return parseLastModified(landing.publishedAt);

  const localized = path.join(contentRoot, locale, "tools", `${slug}.json`);
  if (fs.existsSync(localized)) {
    return parseLastModified(readJsonPublishedAt(localized));
  }

  const legacy = path.join(contentRoot, "tools", `${slug}.json`);
  if (fs.existsSync(legacy)) {
    return parseLastModified(readJsonPublishedAt(legacy));
  }

  return new Date();
}

function articleLastModified(slug: string, locale: AppLocale): Date {
  const meta =
    getArticleMetaBySlugFromRegistry(slug, locale) ??
    getArticleMetaBySlugFromRegistry(slug, defaultLocale);
  return parseLastModified(meta?.publishedAt);
}

/** Absolute hreflang map for a locale-agnostic route path (e.g. `/tools/foo`). */
export function sitemapLanguageAlternates(
  routePath: string,
  availableLocales: readonly AppLocale[] = locales,
): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of availableLocales) {
    languages[locale] = absoluteUrl(localizedPath(locale, routePath));
  }

  const xDefaultLocale = availableLocales.includes(defaultLocale)
    ? defaultLocale
    : availableLocales[0];

  if (xDefaultLocale) {
    languages["x-default"] = absoluteUrl(
      localizedPath(xDefaultLocale, routePath),
    );
  }

  return languages;
}

function entry(
  locale: AppLocale,
  routePath: string,
  options: {
    lastModified?: Date;
    changeFrequency?: ChangeFrequency;
    priority?: number;
    availableLocales?: readonly AppLocale[];
  } = {},
): MetadataRoute.Sitemap[number] {
  const availableLocales = options.availableLocales ?? locales;

  return {
    url: absoluteUrl(localizedPath(locale, routePath)),
    lastModified: options.lastModified ?? new Date(),
    changeFrequency: options.changeFrequency ?? "weekly",
    priority: options.priority,
    alternates: {
      languages: sitemapLanguageAlternates(routePath, availableLocales),
    },
  };
}

export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const toolLandingSlugs = getToolLandingSlugsFromContent();
  const interactiveToolSlugs = getAllSlugs();
  const articleSlugs = getArticleSlugsFromContent();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: ChangeFrequency;
    priority: number;
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/tools", changeFrequency: "weekly", priority: 0.9 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    ...INFO_PAGE_PATHS.map((infoPath) => ({
      path: infoPath,
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
      if (!toolLandingExists(slug, locale)) continue;

      entries.push(
        entry(locale, `/tools/${slug}`, {
          lastModified: toolLandingLastModified(slug, locale),
          changeFrequency: "monthly",
          priority: locale === defaultLocale ? 0.85 : 0.8,
          availableLocales: locales.filter((lng) => toolLandingExists(slug, lng)),
        }),
      );
    }

    for (const slug of interactiveToolSlugs) {
      const landingSlug = toolLandingSlugs.find((candidate) => {
        const landing = getLocalizedToolLanding(candidate, locale);
        if (landing?.toolSlug === slug) return true;

        // Filesystem fallback when registry import lags behind new JSON.
        const filePath = path.join(contentRoot, locale, "tools", `${candidate}.json`);
        if (!fs.existsSync(filePath)) return false;
        try {
          const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
            toolSlug?: string;
          };
          return data.toolSlug === slug;
        } catch {
          return false;
        }
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
          lastModified: articleLastModified(slug, locale),
          changeFrequency: "monthly",
          priority: locale === defaultLocale ? 0.7 : 0.65,
        }),
      );
    }
  }

  return entries;
}
