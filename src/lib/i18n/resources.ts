/**
 * Bundled translation resources per locale.
 * When adding a language: create `locales/{code}/common.json` and register it here.
 */
import type { AppLocale } from "@/lib/i18n/settings";
import en from "../../../locales/en/common.json";
import enBudgetPlanner from "../../../locales/en/budgetPlanner.json";
import enPages from "../../../locales/en/pages.json";
import enRecipeAdjuster from "../../../locales/en/recipeAdjuster.json";
import enTimeValue from "../../../locales/en/timeValue.json";
import enTipSplit from "../../../locales/en/tipSplit.json";
import enUnitCompare from "../../../locales/en/unitCompare.json";
import es from "../../../locales/es/common.json";
import esBudgetPlanner from "../../../locales/es/budgetPlanner.json";
import esPages from "../../../locales/es/pages.json";
import esRecipeAdjuster from "../../../locales/es/recipeAdjuster.json";
import esTimeValue from "../../../locales/es/timeValue.json";
import esTipSplit from "../../../locales/es/tipSplit.json";
import esUnitCompare from "../../../locales/es/unitCompare.json";
import he from "../../../locales/he/common.json";
import heBudgetPlanner from "../../../locales/he/budgetPlanner.json";
import hePages from "../../../locales/he/pages.json";
import heRecipeAdjuster from "../../../locales/he/recipeAdjuster.json";
import heTimeValue from "../../../locales/he/timeValue.json";
import heTipSplit from "../../../locales/he/tipSplit.json";
import heUnitCompare from "../../../locales/he/unitCompare.json";

export const localeResources = {
  en: {
    common: en,
    pages: enPages,
    budgetPlanner: enBudgetPlanner,
    timeValue: enTimeValue,
    tipSplit: enTipSplit,
    recipeAdjuster: enRecipeAdjuster,
    unitCompare: enUnitCompare,
  },
  he: {
    common: he,
    pages: hePages,
    budgetPlanner: heBudgetPlanner,
    timeValue: heTimeValue,
    tipSplit: heTipSplit,
    recipeAdjuster: heRecipeAdjuster,
    unitCompare: heUnitCompare,
  },
  es: {
    common: es,
    pages: esPages,
    budgetPlanner: esBudgetPlanner,
    timeValue: esTimeValue,
    tipSplit: esTipSplit,
    recipeAdjuster: esRecipeAdjuster,
    unitCompare: esUnitCompare,
  },
} satisfies Record<
  AppLocale,
  {
    common: typeof en;
    pages: typeof enPages;
    budgetPlanner: typeof enBudgetPlanner;
    timeValue: typeof enTimeValue;
    tipSplit: typeof enTipSplit;
    recipeAdjuster: typeof enRecipeAdjuster;
    unitCompare: typeof enUnitCompare;
  }
>;
