import { getLocalizedToolLanding } from "@/lib/content/tool-landing-registry";
import type { ToolLandingJson } from "@/lib/content/types";
import type { AppLocale } from "@/lib/i18n/settings";
import { locales } from "@/lib/i18n/settings";
import type { ToolSlug } from "@/lib/tools-registry";
import { getToolBySlug } from "@/lib/tools-registry";

/** Maps interactive tool slugs to their landing-page content slugs. */
export const toolToLandingSlug: Record<ToolSlug, string> = {
  "budget-simple": "budget-planner",
  "time-value": "delegate-or-do",
  "tip-split": "smart-tip-assistant",
  "recipe-adjuster": "recipe-scaler",
  "unit-compare": "smart-shopping-assistant",
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

  return {
    title: landing?.seoTitle ?? landing?.title ?? tool?.meta.name ?? "DailyLogic Tool",
    description:
      landing?.seoDescription ??
      landing?.subtitle ??
      tool?.meta.description ??
      "Free browser-based tool by DailyLogic.",
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
