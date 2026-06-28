import type { ToolSlug } from "@/lib/tools-registry";

/** i18n namespace per interactive tool (matches locales/{locale}/{namespace}.json). */
export const TOOL_I18N_NAMESPACE = {
  "budget-simple": "budgetPlanner",
  "time-value": "timeValue",
  "tip-split": "tipSplit",
  "recipe-adjuster": "recipeAdjuster",
  "unit-compare": "unitCompare",
} as const satisfies Record<ToolSlug, string>;

export type ToolI18nNamespace = (typeof TOOL_I18N_NAMESPACE)[ToolSlug];
