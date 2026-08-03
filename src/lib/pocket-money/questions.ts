import type { PocketQuestion } from "./types";

/**
 * Question bank. Copy lives in locales:
 * questions.{id}.prompt
 * questions.{id}.byAge.{age}
 * questions.{id}.byModel.{model}
 */
export const POCKET_QUESTIONS: PocketQuestion[] = [
  // —— Money responsibility ——
  {
    id: "money-runs-out",
    dimension: "moneyResponsibility",
    secondary: "spendingWisdom",
    quick: true,
    weight: 1.4,
    ageAware: true,
  },
  {
    id: "track-what-spent",
    dimension: "moneyResponsibility",
    quick: true,
    weight: 1.2,
    ageAware: true,
  },
  {
    id: "ask-before-borrow",
    dimension: "moneyResponsibility",
    secondary: "familyPartnership",
    quick: false,
    weight: 1.2,
  },
  {
    id: "own-mistakes",
    dimension: "moneyResponsibility",
    quick: false,
    ageAware: true,
  },
  {
    id: "plan-the-month",
    dimension: "moneyResponsibility",
    secondary: "savingDiscipline",
    quick: false,
    weight: 1.3,
  },
  {
    id: "no-secret-spending",
    dimension: "moneyResponsibility",
    secondary: "familyPartnership",
    quick: false,
  },

  // —— Saving discipline ——
  {
    id: "save-before-spend",
    dimension: "savingDiscipline",
    quick: true,
    weight: 1.4,
  },
  {
    id: "goal-feels-real",
    dimension: "savingDiscipline",
    quick: true,
    weight: 1.3,
    ageAware: true,
  },
  {
    id: "wait-for-want",
    dimension: "savingDiscipline",
    secondary: "spendingWisdom",
    quick: true,
    weight: 1.3,
    ageAware: true,
  },
  {
    id: "celebrate-milestones",
    dimension: "savingDiscipline",
    secondary: "familyPartnership",
    quick: false,
  },
  {
    id: "protect-savings-jar",
    dimension: "savingDiscipline",
    quick: false,
    modelAware: true,
  },
  {
    id: "match-encourage",
    dimension: "savingDiscipline",
    secondary: "familyPartnership",
    quick: false,
    modelAware: true,
  },

  // —— Family partnership ——
  {
    id: "chores-vs-pay",
    dimension: "familyPartnership",
    quick: true,
    weight: 1.4,
    modelAware: true,
  },
  {
    id: "rules-were-agreed",
    dimension: "familyPartnership",
    quick: true,
    weight: 1.3,
  },
  {
    id: "both-voices-heard",
    dimension: "familyPartnership",
    quick: true,
    weight: 1.2,
    ageAware: true,
  },
  {
    id: "review-together",
    dimension: "familyPartnership",
    quick: false,
    weight: 1.2,
  },
  {
    id: "fair-when-busy",
    dimension: "familyPartnership",
    secondary: "moneyResponsibility",
    quick: false,
    modelAware: true,
  },
  {
    id: "praise-not-only-pay",
    dimension: "familyPartnership",
    quick: false,
  },
  {
    id: "sibling-or-friends-pressure",
    dimension: "familyPartnership",
    secondary: "spendingWisdom",
    quick: false,
    ageAware: true,
  },

  // —— Spending wisdom ——
  {
    id: "impulse-pause",
    dimension: "spendingWisdom",
    quick: true,
    weight: 1.3,
    ageAware: true,
  },
  {
    id: "needs-vs-wants",
    dimension: "spendingWisdom",
    quick: true,
    weight: 1.3,
  },
  {
    id: "give-back-share",
    dimension: "spendingWisdom",
    secondary: "familyPartnership",
    quick: false,
    weight: 1.1,
  },
  {
    id: "compare-prices",
    dimension: "spendingWisdom",
    quick: false,
    ageAware: true,
  },
  {
    id: "digital-vs-cash",
    dimension: "spendingWisdom",
    secondary: "moneyResponsibility",
    quick: false,
    ageAware: true,
  },
  {
    id: "earn-extra-ok",
    dimension: "spendingWisdom",
    secondary: "savingDiscipline",
    quick: false,
    modelAware: true,
    weight: 1.2,
  },
];

export function getPocketQuestionsForMode(
  mode: "quick" | "full",
): PocketQuestion[] {
  if (mode === "quick") {
    return POCKET_QUESTIONS.filter((q) => q.quick);
  }
  return POCKET_QUESTIONS;
}
