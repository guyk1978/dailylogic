import type { AppLocale } from "@/lib/i18n/settings";
import { defaultLocale, locales } from "@/lib/i18n/settings";
import type { ContentMeta } from "@/lib/content/types";
import generated from "@/lib/content/article-meta.generated.json";

type ArticleMetaMap = Record<AppLocale, ContentMeta[]>;

const registry = generated as ArticleMetaMap;

export function getAllArticleMetaFromRegistry(
  locale: AppLocale = defaultLocale,
): ContentMeta[] {
  return registry[locale] ?? registry[defaultLocale] ?? [];
}

export function getArticleMetaBySlugFromRegistry(
  slug: string,
  locale: AppLocale = defaultLocale,
): ContentMeta | null {
  const list = getAllArticleMetaFromRegistry(locale);
  return list.find((article) => article.slug === slug) ?? null;
}

export function getArticleSlugsFromRegistry(): string[] {
  const slugs = new Set<string>();
  for (const locale of locales) {
    for (const article of registry[locale] ?? []) {
      slugs.add(article.slug);
    }
  }
  return [...slugs];
}
