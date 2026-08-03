import type { MentalQuestion } from "./types";

/**
 * Question bank. Copy in locales:
 * questions.{id}.prompt
 * questions.{id}.options.{1-5}
 * questions.{id}.byPeriod.{period}
 * questions.{id}.byFatigue.{fatigue}
 * questions.{id}.byFocus.{focus}
 */
export const MENTAL_QUESTIONS: MentalQuestion[] = [
  // —— Stress balance ——
  {
    id: "pressure-without-spiral",
    dimension: "stressBalance",
    quick: true,
    weight: 1.4,
    periodAware: true,
  },
  {
    id: "one-thing-at-a-time",
    dimension: "stressBalance",
    quick: true,
    weight: 1.2,
  },
  {
    id: "worry-about-tomorrow",
    dimension: "stressBalance",
    quick: true,
    weight: 1.3,
    focusAware: true,
  },
  {
    id: "work-study-cutoff",
    dimension: "stressBalance",
    secondary: "personalSpace",
    quick: true,
    periodAware: true,
  },
  {
    id: "catch-thought-loops",
    dimension: "stressBalance",
    quick: false,
  },
  {
    id: "ask-for-help-early",
    dimension: "stressBalance",
    secondary: "personalSpace",
    quick: false,
    weight: 1.2,
  },
  {
    id: "accept-imperfect-day",
    dimension: "stressBalance",
    quick: false,
  },
  {
    id: "name-what-weighs",
    dimension: "stressBalance",
    quick: false,
    weight: 1.2,
  },
  {
    id: "pause-before-react",
    dimension: "stressBalance",
    secondary: "personalSpace",
    quick: true,
    weight: 1.3,
  },
  {
    id: "leave-work-at-work",
    dimension: "stressBalance",
    quick: false,
    periodAware: true,
  },

  // —— Rest & energy ——
  {
    id: "sleep-protect",
    dimension: "restEnergy",
    quick: true,
    weight: 1.4,
    fatigueAware: true,
  },
  {
    id: "small-recharge",
    dimension: "restEnergy",
    quick: true,
    weight: 1.3,
  },
  {
    id: "meals-and-water",
    dimension: "restEnergy",
    quick: false,
  },
  {
    id: "move-a-little",
    dimension: "restEnergy",
    quick: false,
  },
  {
    id: "screen-wind-down",
    dimension: "restEnergy",
    secondary: "stressBalance",
    quick: false,
    fatigueAware: true,
  },
  {
    id: "weekend-recover",
    dimension: "restEnergy",
    quick: false,
  },
  {
    id: "say-no-to-extra",
    dimension: "restEnergy",
    secondary: "personalSpace",
    quick: true,
    weight: 1.3,
  },
  {
    id: "energy-honest-check",
    dimension: "restEnergy",
    quick: false,
    fatigueAware: true,
  },
  {
    id: "stop-when-tired",
    dimension: "restEnergy",
    quick: false,
    weight: 1.2,
  },
  {
    id: "keep-morning-gentle",
    dimension: "restEnergy",
    quick: false,
  },

  // —— Personal space & quiet ——
  {
    id: "protect-quiet-time",
    dimension: "personalSpace",
    quick: true,
    weight: 1.4,
    focusAware: true,
  },
  {
    id: "soft-no-without-guilt",
    dimension: "personalSpace",
    quick: true,
    weight: 1.3,
  },
  {
    id: "people-energy-guard",
    dimension: "personalSpace",
    quick: false,
  },
  {
    id: "finish-without-rush",
    dimension: "personalSpace",
    secondary: "stressBalance",
    quick: false,
  },
  {
    id: "news-and-noise-limit",
    dimension: "personalSpace",
    secondary: "stressBalance",
    quick: false,
  },
  {
    id: "talk-to-someone-safe",
    dimension: "personalSpace",
    quick: false,
    weight: 1.2,
  },
  {
    id: "celebrate-small-wins",
    dimension: "personalSpace",
    secondary: "restEnergy",
    quick: false,
  },
  {
    id: "room-to-breathe",
    dimension: "personalSpace",
    quick: false,
    focusAware: true,
    weight: 1.3,
  },
  {
    id: "plan-tiny-joy",
    dimension: "personalSpace",
    secondary: "restEnergy",
    quick: false,
  },
  {
    id: "evening-close-ritual",
    dimension: "personalSpace",
    secondary: "restEnergy",
    quick: false,
  },
];

export function getMentalQuestionsForMode(
  mode: "quick" | "full",
): MentalQuestion[] {
  if (mode === "full") return MENTAL_QUESTIONS;
  return MENTAL_QUESTIONS.filter((q) => q.quick);
}
