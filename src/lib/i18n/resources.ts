/**
 * Bundled translation resources per locale.
 * When adding a language: create `locales/{code}/common.json` and register it here.
 */
import type { AppLocale } from "@/lib/i18n/settings";
import en from "../../../locales/en/common.json";
import enBudgetPlanner from "../../../locales/en/budgetPlanner.json";
import enPages from "../../../locales/en/pages.json";
import enIngredients from "../../../locales/en/ingredients.json";
import enRecipeAdjuster from "../../../locales/en/recipeAdjuster.json";
import enTimeValue from "../../../locales/en/timeValue.json";
import enTipSplit from "../../../locales/en/tipSplit.json";
import enUnitCompare from "../../../locales/en/unitCompare.json";
import enLoveCalculator from "../../../locales/en/loveCalculator.json";
import enRelationshipDepth from "../../../locales/en/relationshipDepth.json";
import enBusinessPartnership from "../../../locales/en/businessPartnership.json";
import enPocketMoney from "../../../locales/en/pocketMoney.json";
import enDogOwnership from "../../../locales/en/dogOwnership.json";
import enParentRespect from "../../../locales/en/parentRespect.json";
import enStrangerSharing from "../../../locales/en/strangerSharing.json";
import enMentalHealth from "../../../locales/en/mentalHealth.json";
import enPhysicalHealth from "../../../locales/en/physicalHealth.json";
import enCalorieBurn from "../../../locales/en/calorieBurn.json";
import es from "../../../locales/es/common.json";
import esBudgetPlanner from "../../../locales/es/budgetPlanner.json";
import esIngredients from "../../../locales/es/ingredients.json";
import esPages from "../../../locales/es/pages.json";
import esRecipeAdjuster from "../../../locales/es/recipeAdjuster.json";
import esTimeValue from "../../../locales/es/timeValue.json";
import esTipSplit from "../../../locales/es/tipSplit.json";
import esUnitCompare from "../../../locales/es/unitCompare.json";
import esLoveCalculator from "../../../locales/es/loveCalculator.json";
import esRelationshipDepth from "../../../locales/es/relationshipDepth.json";
import esBusinessPartnership from "../../../locales/es/businessPartnership.json";
import esPocketMoney from "../../../locales/es/pocketMoney.json";
import esDogOwnership from "../../../locales/es/dogOwnership.json";
import esParentRespect from "../../../locales/es/parentRespect.json";
import esStrangerSharing from "../../../locales/es/strangerSharing.json";
import esMentalHealth from "../../../locales/es/mentalHealth.json";
import esPhysicalHealth from "../../../locales/es/physicalHealth.json";
import esCalorieBurn from "../../../locales/es/calorieBurn.json";
import he from "../../../locales/he/common.json";
import heBudgetPlanner from "../../../locales/he/budgetPlanner.json";
import heIngredients from "../../../locales/he/ingredients.json";
import hePages from "../../../locales/he/pages.json";
import heRecipeAdjuster from "../../../locales/he/recipeAdjuster.json";
import heTimeValue from "../../../locales/he/timeValue.json";
import heTipSplit from "../../../locales/he/tipSplit.json";
import heUnitCompare from "../../../locales/he/unitCompare.json";
import heLoveCalculator from "../../../locales/he/loveCalculator.json";
import heRelationshipDepth from "../../../locales/he/relationshipDepth.json";
import heBusinessPartnership from "../../../locales/he/businessPartnership.json";
import hePocketMoney from "../../../locales/he/pocketMoney.json";
import heDogOwnership from "../../../locales/he/dogOwnership.json";
import heParentRespect from "../../../locales/he/parentRespect.json";
import heStrangerSharing from "../../../locales/he/strangerSharing.json";
import heMentalHealth from "../../../locales/he/mentalHealth.json";
import hePhysicalHealth from "../../../locales/he/physicalHealth.json";
import heCalorieBurn from "../../../locales/he/calorieBurn.json";

export const localeResources = {
  en: {
    common: en,
    pages: enPages,
    budgetPlanner: enBudgetPlanner,
    timeValue: enTimeValue,
    tipSplit: enTipSplit,
    recipeAdjuster: enRecipeAdjuster,
    unitCompare: enUnitCompare,
    loveCalculator: enLoveCalculator,
    relationshipDepth: enRelationshipDepth,
    businessPartnership: enBusinessPartnership,
    pocketMoney: enPocketMoney,
    dogOwnership: enDogOwnership,
    parentRespect: enParentRespect,
    strangerSharing: enStrangerSharing,
    mentalHealth: enMentalHealth,
    physicalHealth: enPhysicalHealth,
    calorieBurn: enCalorieBurn,
    ingredients: enIngredients,
  },
  he: {
    common: he,
    pages: hePages,
    budgetPlanner: heBudgetPlanner,
    timeValue: heTimeValue,
    tipSplit: heTipSplit,
    recipeAdjuster: heRecipeAdjuster,
    unitCompare: heUnitCompare,
    loveCalculator: heLoveCalculator,
    relationshipDepth: heRelationshipDepth,
    businessPartnership: heBusinessPartnership,
    pocketMoney: hePocketMoney,
    dogOwnership: heDogOwnership,
    parentRespect: heParentRespect,
    strangerSharing: heStrangerSharing,
    mentalHealth: heMentalHealth,
    physicalHealth: hePhysicalHealth,
    calorieBurn: heCalorieBurn,
    ingredients: heIngredients,
  },
  es: {
    common: es,
    pages: esPages,
    budgetPlanner: esBudgetPlanner,
    timeValue: esTimeValue,
    tipSplit: esTipSplit,
    recipeAdjuster: esRecipeAdjuster,
    unitCompare: esUnitCompare,
    loveCalculator: esLoveCalculator,
    relationshipDepth: esRelationshipDepth,
    businessPartnership: esBusinessPartnership,
    pocketMoney: esPocketMoney,
    dogOwnership: esDogOwnership,
    parentRespect: esParentRespect,
    strangerSharing: esStrangerSharing,
    mentalHealth: esMentalHealth,
    physicalHealth: esPhysicalHealth,
    calorieBurn: esCalorieBurn,
    ingredients: esIngredients,
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
    loveCalculator: typeof enLoveCalculator;
    relationshipDepth: typeof enRelationshipDepth;
    businessPartnership: typeof enBusinessPartnership;
    pocketMoney: typeof enPocketMoney;
    dogOwnership: typeof enDogOwnership;
    parentRespect: typeof enParentRespect;
    strangerSharing: typeof enStrangerSharing;
    mentalHealth: typeof enMentalHealth;
    physicalHealth: typeof enPhysicalHealth;
    calorieBurn: typeof enCalorieBurn;
    ingredients: typeof enIngredients;
  }
>;
