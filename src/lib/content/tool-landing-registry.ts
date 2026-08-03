import type { AppLocale } from "@/lib/i18n/settings";
import type { ToolLandingJson } from "@/lib/content/types";

import budgetPlannerEn from "../../../content/en/tools/budget-planner.json";
import recipeScalerEn from "../../../content/en/tools/recipe-scaler.json";
import delegateOrDoEn from "../../../content/en/tools/delegate-or-do.json";
import smartTipEn from "../../../content/en/tools/smart-tip-assistant.json";
import smartShoppingEn from "../../../content/en/tools/smart-shopping-assistant.json";
import everydayLoveEn from "../../../content/en/tools/everyday-love-calculator.json";
import relationshipDepthEn from "../../../content/en/tools/relationship-depth-calculator.json";
import businessPartnershipEn from "../../../content/en/tools/business-partnership-calculator.json";
import pocketMoneyEn from "../../../content/en/tools/pocket-money-calculator.json";
import dogOwnershipEn from "../../../content/en/tools/dog-ownership-calculator.json";
import parentRespectEn from "../../../content/en/tools/parent-respect-calculator.json";
import strangerSharingEn from "../../../content/en/tools/stranger-sharing-calculator.json";

import budgetPlannerHe from "../../../content/he/tools/budget-planner.json";
import recipeScalerHe from "../../../content/he/tools/recipe-scaler.json";
import delegateOrDoHe from "../../../content/he/tools/delegate-or-do.json";
import smartTipHe from "../../../content/he/tools/smart-tip-assistant.json";
import smartShoppingHe from "../../../content/he/tools/smart-shopping-assistant.json";
import everydayLoveHe from "../../../content/he/tools/everyday-love-calculator.json";
import relationshipDepthHe from "../../../content/he/tools/relationship-depth-calculator.json";
import businessPartnershipHe from "../../../content/he/tools/business-partnership-calculator.json";
import pocketMoneyHe from "../../../content/he/tools/pocket-money-calculator.json";
import dogOwnershipHe from "../../../content/he/tools/dog-ownership-calculator.json";
import parentRespectHe from "../../../content/he/tools/parent-respect-calculator.json";
import strangerSharingHe from "../../../content/he/tools/stranger-sharing-calculator.json";

import budgetPlannerEs from "../../../content/es/tools/budget-planner.json";
import recipeScalerEs from "../../../content/es/tools/recipe-scaler.json";
import delegateOrDoEs from "../../../content/es/tools/delegate-or-do.json";
import smartTipEs from "../../../content/es/tools/smart-tip-assistant.json";
import smartShoppingEs from "../../../content/es/tools/smart-shopping-assistant.json";
import everydayLoveEs from "../../../content/es/tools/everyday-love-calculator.json";
import relationshipDepthEs from "../../../content/es/tools/relationship-depth-calculator.json";
import businessPartnershipEs from "../../../content/es/tools/business-partnership-calculator.json";
import pocketMoneyEs from "../../../content/es/tools/pocket-money-calculator.json";
import dogOwnershipEs from "../../../content/es/tools/dog-ownership-calculator.json";
import parentRespectEs from "../../../content/es/tools/parent-respect-calculator.json";
import strangerSharingEs from "../../../content/es/tools/stranger-sharing-calculator.json";

const registry: Record<AppLocale, Record<string, ToolLandingJson>> = {
  en: {
    "budget-planner": budgetPlannerEn as ToolLandingJson,
    "recipe-scaler": recipeScalerEn as ToolLandingJson,
    "delegate-or-do": delegateOrDoEn as ToolLandingJson,
    "smart-tip-assistant": smartTipEn as ToolLandingJson,
    "smart-shopping-assistant": smartShoppingEn as ToolLandingJson,
    "everyday-love-calculator": everydayLoveEn as ToolLandingJson,
    "relationship-depth-calculator": relationshipDepthEn as ToolLandingJson,
    "business-partnership-calculator": businessPartnershipEn as ToolLandingJson,
    "pocket-money-calculator": pocketMoneyEn as ToolLandingJson,
    "dog-ownership-calculator": dogOwnershipEn as ToolLandingJson,
    "parent-respect-calculator": parentRespectEn as ToolLandingJson,
    "stranger-sharing-calculator": strangerSharingEn as ToolLandingJson,
  },
  he: {
    "budget-planner": budgetPlannerHe as ToolLandingJson,
    "recipe-scaler": recipeScalerHe as ToolLandingJson,
    "delegate-or-do": delegateOrDoHe as ToolLandingJson,
    "smart-tip-assistant": smartTipHe as ToolLandingJson,
    "smart-shopping-assistant": smartShoppingHe as ToolLandingJson,
    "everyday-love-calculator": everydayLoveHe as ToolLandingJson,
    "relationship-depth-calculator": relationshipDepthHe as ToolLandingJson,
    "business-partnership-calculator": businessPartnershipHe as ToolLandingJson,
    "pocket-money-calculator": pocketMoneyHe as ToolLandingJson,
    "dog-ownership-calculator": dogOwnershipHe as ToolLandingJson,
    "parent-respect-calculator": parentRespectHe as ToolLandingJson,
    "stranger-sharing-calculator": strangerSharingHe as ToolLandingJson,
  },
  es: {
    "budget-planner": budgetPlannerEs as ToolLandingJson,
    "recipe-scaler": recipeScalerEs as ToolLandingJson,
    "delegate-or-do": delegateOrDoEs as ToolLandingJson,
    "smart-tip-assistant": smartTipEs as ToolLandingJson,
    "smart-shopping-assistant": smartShoppingEs as ToolLandingJson,
    "everyday-love-calculator": everydayLoveEs as ToolLandingJson,
    "relationship-depth-calculator": relationshipDepthEs as ToolLandingJson,
    "business-partnership-calculator": businessPartnershipEs as ToolLandingJson,
    "pocket-money-calculator": pocketMoneyEs as ToolLandingJson,
    "dog-ownership-calculator": dogOwnershipEs as ToolLandingJson,
    "parent-respect-calculator": parentRespectEs as ToolLandingJson,
    "stranger-sharing-calculator": strangerSharingEs as ToolLandingJson,
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
    title: landing.title,
    description: landing.subtitle ?? landing.seoDescription ?? "",
    publishedAt: landing.publishedAt,
  };
}

export function getAllLocalizedToolLandingMeta(locale: AppLocale) {
  return getLocalizedToolLandingSlugs().flatMap((slug) => {
    const meta = getLocalizedToolLandingMeta(slug, locale);
    return meta ? [meta] : [];
  });
}
