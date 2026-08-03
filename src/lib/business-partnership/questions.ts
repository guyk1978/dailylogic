import type { BusinessQuestion } from "./types";

/**
 * Question bank. Default prompts + optional industry variants live in locales:
 * questions.{id}.prompt
 * questions.{id}.options.{1-5}
 * questions.{id}.byIndustry.{industry}
 */
export const BUSINESS_QUESTIONS: BusinessQuestion[] = [
  // —— Ops / contractual resilience ——
  {
    id: "decide-under-pressure",
    dimension: "opsResilience",
    secondary: "conflictGovernance",
    quick: true,
    weight: 1.3,
  },
  {
    id: "failure-ownership",
    dimension: "opsResilience",
    quick: true,
    weight: 1.4,
    industryAware: true,
  },
  {
    id: "roles-clear",
    dimension: "opsResilience",
    secondary: "workloadClarity",
    quick: true,
  },
  {
    id: "exit-talked",
    dimension: "opsResilience",
    secondary: "financialAlignment",
    quick: false,
    weight: 1.4,
  },
  {
    id: "red-lines-named",
    dimension: "opsResilience",
    secondary: "conflictGovernance",
    quick: false,
    weight: 1.3,
  },
  {
    id: "crisis-playbook",
    dimension: "opsResilience",
    quick: false,
    industryAware: true,
  },
  {
    id: "ip-or-assets-clarity",
    dimension: "opsResilience",
    secondary: "financialAlignment",
    quick: false,
    industryAware: true,
    weight: 1.2,
  },
  {
    id: "vendors-and-deps",
    dimension: "opsResilience",
    quick: false,
    industryAware: true,
  },

  // —— Financial alignment ——
  {
    id: "money-talks-honest",
    dimension: "financialAlignment",
    quick: true,
    weight: 1.3,
  },
  {
    id: "first-money-vs-sweat",
    dimension: "financialAlignment",
    secondary: "workloadClarity",
    quick: true,
    weight: 1.3,
  },
  {
    id: "equity-feels-fair",
    dimension: "financialAlignment",
    quick: true,
    weight: 1.2,
  },
  {
    id: "burn-and-runway",
    dimension: "financialAlignment",
    secondary: "opsResilience",
    quick: false,
  },
  {
    id: "salary-vs-reinvest",
    dimension: "financialAlignment",
    quick: false,
  },
  {
    id: "expense-authority",
    dimension: "financialAlignment",
    secondary: "conflictGovernance",
    quick: false,
  },
  {
    id: "investor-or-debt-views",
    dimension: "financialAlignment",
    quick: false,
  },
  {
    id: "profit-distribution-rules",
    dimension: "financialAlignment",
    quick: false,
    weight: 1.2,
  },

  // —— Conflict governance ——
  {
    id: "disagree-then-decide",
    dimension: "conflictGovernance",
    quick: true,
    weight: 1.3,
  },
  {
    id: "ego-in-meetings",
    dimension: "conflictGovernance",
    secondary: "workloadClarity",
    quick: true,
  },
  {
    id: "feedback-without-war",
    dimension: "conflictGovernance",
    quick: false,
  },
  {
    id: "deadlock-break",
    dimension: "conflictGovernance",
    secondary: "opsResilience",
    quick: false,
    weight: 1.3,
  },
  {
    id: "client-or-team-conflict",
    dimension: "conflictGovernance",
    quick: false,
    industryAware: true,
  },
  {
    id: "apology-and-course-correct",
    dimension: "conflictGovernance",
    quick: false,
  },
  {
    id: "transparency-default",
    dimension: "conflictGovernance",
    secondary: "financialAlignment",
    quick: false,
  },

  // —— Workload / clarity ——
  {
    id: "pace-mismatch",
    dimension: "workloadClarity",
    quick: true,
    weight: 1.2,
  },
  {
    id: "invisible-labor",
    dimension: "workloadClarity",
    secondary: "financialAlignment",
    quick: true,
    weight: 1.2,
  },
  {
    id: "who-owns-delivery",
    dimension: "workloadClarity",
    secondary: "opsResilience",
    quick: false,
    industryAware: true,
  },
  {
    id: "time-off-without-guilt",
    dimension: "workloadClarity",
    quick: false,
  },
  {
    id: "hiring-and-firing-views",
    dimension: "workloadClarity",
    secondary: "conflictGovernance",
    quick: false,
  },
  {
    id: "communication-cadence",
    dimension: "workloadClarity",
    quick: false,
  },
  {
    id: "vision-still-shared",
    dimension: "workloadClarity",
    secondary: "opsResilience",
    quick: false,
    weight: 1.2,
  },
];

export function getBusinessQuestionsForMode(
  mode: "quick" | "full",
): BusinessQuestion[] {
  if (mode === "quick") {
    return BUSINESS_QUESTIONS.filter((q) => q.quick);
  }
  return BUSINESS_QUESTIONS;
}
