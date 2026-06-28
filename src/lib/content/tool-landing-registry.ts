import type { AppLocale } from "@/lib/i18n/settings";
import type { ToolLandingJson } from "@/lib/content/types";

import budgetPlannerEn from "../../../content/en/tools/budget-planner.json";
import recipeScalerEn from "../../../content/en/tools/recipe-scaler.json";
import delegateOrDoEn from "../../../content/en/tools/delegate-or-do.json";
import smartTipEn from "../../../content/en/tools/smart-tip-assistant.json";
import smartShoppingEn from "../../../content/en/tools/smart-shopping-assistant.json";

import budgetPlannerHe from "../../../content/he/tools/budget-planner.json";
import recipeScalerHe from "../../../content/he/tools/recipe-scaler.json";
import delegateOrDoHe from "../../../content/he/tools/delegate-or-do.json";
import smartTipHe from "../../../content/he/tools/smart-tip-assistant.json";
import smartShoppingHe from "../../../content/he/tools/smart-shopping-assistant.json";

import budgetPlannerEs from "../../../content/es/tools/budget-planner.json";
import recipeScalerEs from "../../../content/es/tools/recipe-scaler.json";
import delegateOrDoEs from "../../../content/es/tools/delegate-or-do.json";
import smartTipEs from "../../../content/es/tools/smart-tip-assistant.json";
import smartShoppingEs from "../../../content/es/tools/smart-shopping-assistant.json";

const registry: Record<AppLocale, Record<string, ToolLandingJson>> = {
  en: {
    "budget-planner": budgetPlannerEn as ToolLandingJson,
    "recipe-scaler": recipeScalerEn as ToolLandingJson,
    "delegate-or-do": delegateOrDoEn as ToolLandingJson,
    "smart-tip-assistant": smartTipEn as ToolLandingJson,
    "smart-shopping-assistant": smartShoppingEn as ToolLandingJson,
  },
  he: {
    "budget-planner": budgetPlannerHe as ToolLandingJson,
    "recipe-scaler": recipeScalerHe as ToolLandingJson,
    "delegate-or-do": delegateOrDoHe as ToolLandingJson,
    "smart-tip-assistant": smartTipHe as ToolLandingJson,
    "smart-shopping-assistant": smartShoppingHe as ToolLandingJson,
  },
  es: {
    "budget-planner": budgetPlannerEs as ToolLandingJson,
    "recipe-scaler": recipeScalerEs as ToolLandingJson,
    "delegate-or-do": delegateOrDoEs as ToolLandingJson,
    "smart-tip-assistant": smartTipEs as ToolLandingJson,
    "smart-shopping-assistant": smartShoppingEs as ToolLandingJson,
  },
};

export function getLocalizedToolLanding(
  slug: string,
  locale: AppLocale,
): ToolLandingJson | null {
  return registry[locale][slug] ?? registry.en[slug] ?? null;
}

export function getLocalizedToolLandingSlugs(): string[] {
  return Object.keys(registry.en);
}

export function getLocalizedToolLandingMeta(
  slug: string,
  locale: AppLocale,
): { slug: string; title: string; description: string; publishedAt?: string } | null {
  const landing = getLocalizedToolLanding(slug, locale);
  if (!landing) return null;

  return {
    slug,
    title: landing.seoTitle ?? landing.title,
    description: landing.seoDescription ?? landing.subtitle,
    publishedAt: landing.publishedAt,
  };
}

export function getAllLocalizedToolLandingMeta(locale: AppLocale) {
  return getLocalizedToolLandingSlugs().flatMap((slug) => {
    const meta = getLocalizedToolLandingMeta(slug, locale);
    return meta ? [meta] : [];
  });
}
