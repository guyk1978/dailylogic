import { getLocalizedToolLanding } from "@/lib/content/tool-landing-registry";
import type { ToolLandingJson } from "@/lib/content/types";
import { localeResources } from "@/lib/i18n/resources";
import type { AppLocale } from "@/lib/i18n/settings";
import { locales } from "@/lib/i18n/settings";
import type { ToolSlug } from "@/lib/tools-registry";
import { getToolBySlug } from "@/lib/tools-registry";

const toolSeoFallbacks: Record<
  AppLocale,
  { title: string; description: string }
> = {
  en: {
    title: "DailyLogic Tool",
    description: "Free browser-based tool by DailyLogic.",
  },
  he: {
    title: "כלי לוגיקה יומית",
    description: "כלי חינמי בדפדפן מאת לוגיקה יומית.",
  },
  es: {
    title: "Herramienta de Lógica diaria",
    description: "Herramienta gratuita en el navegador de Lógica diaria.",
  },
};

/** Maps interactive tool slugs to their landing-page content slugs. */
export const toolToLandingSlug: Record<ToolSlug, string> = {
  "budget-simple": "budget-planner",
  "time-value": "delegate-or-do",
  "tip-split": "smart-tip-assistant",
  "recipe-adjuster": "recipe-scaler",
  "unit-compare": "smart-shopping-assistant",
  "love-calculator": "everyday-love-calculator",
  "relationship-depth": "relationship-depth-calculator",
  "business-partnership-calculator": "business-partnership-calculator",
  "pocket-money-calculator": "pocket-money-calculator",
  "dog-ownership-calculator": "dog-ownership-calculator",
  "parent-respect-calculator": "parent-respect-calculator",
  "stranger-sharing-calculator": "stranger-sharing-calculator",
  "mental-health-calculator": "mental-health-calculator",
  "physical-health-calculator": "physical-health-calculator",
  "calorie-burn-calculator": "calorie-burn-calculator",
};

export function getLandingSlugForTool(toolSlug: ToolSlug): string {
  return toolToLandingSlug[toolSlug];
}

export function getToolSeoContent(
  toolSlug: ToolSlug,
  locale: AppLocale,
): ToolLandingJson | null {
  const landingSlug = getLandingSlugForTool(toolSlug);
  return getLocalizedToolLanding(landingSlug, locale);
}

export function countSeoWords(landing: ToolLandingJson): number {
  const sectionText = (landing.sections ?? [])
    .flatMap((section) => section.paragraphs)
    .join(" ");
  const benefitText = landing.benefits
    .map((b) => `${b.title} ${b.description}`)
    .join(" ");
  const faqText = landing.faq.map((f) => `${f.question} ${f.answer}`).join(" ");
  const body = `${landing.heroDescription} ${sectionText} ${benefitText} ${faqText}`;
  return body.split(/\s+/).filter(Boolean).length;
}

export function getToolSeoMetadata(
  toolSlug: ToolSlug,
  locale: AppLocale,
): { title: string; description: string } {
  const landing = getToolSeoContent(toolSlug, locale);
  const tool = getToolBySlug(toolSlug);
  const fallback = toolSeoFallbacks[locale];
  const tools = localeResources[locale].common.tools;
  const translated = tools[toolSlug as keyof typeof tools];

  return {
    title:
      landing?.seoTitle ??
      landing?.title ??
      translated?.name ??
      tool?.meta.name ??
      fallback.title,
    description:
      landing?.seoDescription ??
      landing?.subtitle ??
      translated?.description ??
      tool?.meta.description ??
      fallback.description,
  };
}

export function getToolAlternateLanguages(toolSlug: ToolSlug): Record<string, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, `/${locale}/tool/${toolSlug}`]),
  );
}

export function getLandingAlternateLanguages(landingSlug: string): Record<string, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, `/${locale}/tools/${landingSlug}`]),
  );
}
