import type { RelationshipQuestion } from "./types";

/**
 * Question bank. Prompt + per-question options live in locales under
 * questions.{id}.prompt and questions.{id}.options.{1-5}
 * (falls back to scale.* if options missing).
 *
 * Quick mode uses questions with quick:true (10).
 * Full mode uses all 30.
 */
export const RELATIONSHIP_QUESTIONS: RelationshipQuestion[] = [
  // —— Communication ——
  {
    id: "talk-hard-topics",
    dimension: "communication",
    secondary: "resilience",
    quick: true,
    weight: 1.2,
  },
  {
    id: "listen-to-understand",
    dimension: "communication",
    quick: true,
  },
  {
    id: "repair-after-fight",
    dimension: "communication",
    secondary: "resilience",
    quick: true,
    weight: 1.3,
  },
  {
    id: "daily-checkins",
    dimension: "communication",
    quick: false,
  },
  {
    id: "honest-without-cruel",
    dimension: "communication",
    quick: false,
  },
  {
    id: "disagree-respect",
    dimension: "communication",
    secondary: "personalSpace",
    quick: false,
  },
  {
    id: "humor-in-friction",
    dimension: "communication",
    secondary: "sharedGrowth",
    quick: false,
  },
  {
    id: "say-needs-clearly",
    dimension: "communication",
    quick: false,
  },

  // —— Resilience ——
  {
    id: "crisis-support",
    dimension: "resilience",
    secondary: "communication",
    quick: true,
    weight: 1.4,
  },
  {
    id: "stress-teamwork",
    dimension: "resilience",
    quick: true,
    weight: 1.2,
  },
  {
    id: "bounce-after-hurt",
    dimension: "resilience",
    quick: true,
  },
  {
    id: "money-tension",
    dimension: "resilience",
    secondary: "communication",
    quick: false,
  },
  {
    id: "family-pressure",
    dimension: "resilience",
    quick: false,
  },
  {
    id: "health-or-hard-week",
    dimension: "resilience",
    secondary: "sharedGrowth",
    quick: false,
  },
  {
    id: "trust-under-doubt",
    dimension: "resilience",
    quick: false,
    weight: 1.3,
  },
  {
    id: "apologize-and-change",
    dimension: "resilience",
    secondary: "communication",
    quick: false,
  },

  // —— Personal space ——
  {
    id: "alone-time-ok",
    dimension: "personalSpace",
    quick: true,
    weight: 1.2,
  },
  {
    id: "friends-without-guilt",
    dimension: "personalSpace",
    quick: true,
  },
  {
    id: "hobbies-respected",
    dimension: "personalSpace",
    quick: false,
  },
  {
    id: "no-mind-reading",
    dimension: "personalSpace",
    secondary: "communication",
    quick: false,
  },
  {
    id: "boundaries-held",
    dimension: "personalSpace",
    secondary: "resilience",
    quick: false,
    weight: 1.2,
  },
  {
    id: "togetherness-not-fusion",
    dimension: "personalSpace",
    secondary: "sharedGrowth",
    quick: false,
  },
  {
    id: "jealousy-handled",
    dimension: "personalSpace",
    secondary: "communication",
    quick: false,
  },

  // —— Shared growth ——
  {
    id: "future-talks",
    dimension: "sharedGrowth",
    quick: true,
    weight: 1.2,
  },
  {
    id: "celebrate-wins",
    dimension: "sharedGrowth",
    quick: true,
  },
  {
    id: "learn-from-conflict",
    dimension: "sharedGrowth",
    secondary: "resilience",
    quick: false,
  },
  {
    id: "shared-rituals",
    dimension: "sharedGrowth",
    quick: false,
  },
  {
    id: "support-dreams",
    dimension: "sharedGrowth",
    secondary: "personalSpace",
    quick: false,
    weight: 1.2,
  },
  {
    id: "fair-load-home",
    dimension: "sharedGrowth",
    secondary: "resilience",
    quick: false,
    weight: 1.3,
  },
  {
    id: "intimacy-of-ordinary",
    dimension: "sharedGrowth",
    secondary: "communication",
    quick: false,
  },
];

export function getQuestionsForMode(mode: "quick" | "full"): RelationshipQuestion[] {
  if (mode === "quick") {
    return RELATIONSHIP_QUESTIONS.filter((q) => q.quick);
  }
  return RELATIONSHIP_QUESTIONS;
}
