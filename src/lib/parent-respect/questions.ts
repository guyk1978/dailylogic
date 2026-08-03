import type { ParentQuestion } from "./types";

/**
 * Question bank. Copy in locales:
 * questions.{id}.prompt
 * questions.{id}.options.{1-5}
 * questions.{id}.byDistance.{distance}
 * questions.{id}.byStage.{stage}
 */
export const PARENT_QUESTIONS: ParentQuestion[] = [
  // —— Presence ——
  {
    id: "show-up-consistently",
    dimension: "presence",
    quick: true,
    weight: 1.3,
    distanceAware: true,
  },
  {
    id: "small-gestures",
    dimension: "presence",
    quick: true,
    weight: 1.2,
  },
  {
    id: "mark-dates",
    dimension: "presence",
    quick: true,
  },
  {
    id: "quality-over-rush",
    dimension: "presence",
    secondary: "listening",
    quick: true,
    distanceAware: true,
  },
  {
    id: "invite-into-life",
    dimension: "presence",
    quick: false,
  },
  {
    id: "follow-through-promises",
    dimension: "presence",
    secondary: "emotionalBalance",
    quick: false,
    weight: 1.3,
  },
  {
    id: "help-without-being-asked",
    dimension: "presence",
    secondary: "emotionalBalance",
    quick: false,
    stageAware: true,
  },
  {
    id: "stay-in-touch-busy",
    dimension: "presence",
    quick: false,
    distanceAware: true,
  },

  // —— Listening ——
  {
    id: "listen-without-fix",
    dimension: "listening",
    quick: true,
    weight: 1.4,
  },
  {
    id: "ask-real-questions",
    dimension: "listening",
    quick: true,
    weight: 1.2,
  },
  {
    id: "remember-details",
    dimension: "listening",
    secondary: "presence",
    quick: true,
  },
  {
    id: "patience-with-repeat",
    dimension: "listening",
    quick: false,
    stageAware: true,
    weight: 1.3,
  },
  {
    id: "respect-their-pace",
    dimension: "listening",
    secondary: "emotionalBalance",
    quick: false,
  },
  {
    id: "hear-worry-underneath",
    dimension: "listening",
    quick: false,
    weight: 1.2,
  },
  {
    id: "disagree-with-honor",
    dimension: "listening",
    secondary: "emotionalBalance",
    quick: false,
    weight: 1.3,
  },
  {
    id: "phone-call-presence",
    dimension: "listening",
    quick: false,
    distanceAware: true,
  },

  // —— Emotional balance ——
  {
    id: "boundaries-without-cut",
    dimension: "emotionalBalance",
    quick: true,
    weight: 1.4,
  },
  {
    id: "guilt-managed",
    dimension: "emotionalBalance",
    quick: true,
    weight: 1.3,
  },
  {
    id: "own-family-balance",
    dimension: "emotionalBalance",
    secondary: "presence",
    quick: true,
    weight: 1.3,
  },
  {
    id: "crisis-show-up",
    dimension: "emotionalBalance",
    secondary: "presence",
    quick: false,
    stageAware: true,
    weight: 1.4,
  },
  {
    id: "no-scorekeeping",
    dimension: "emotionalBalance",
    quick: false,
  },
  {
    id: "sibling-or-alone-load",
    dimension: "emotionalBalance",
    quick: false,
  },
  {
    id: "speak-needs-calmly",
    dimension: "emotionalBalance",
    secondary: "listening",
    quick: false,
  },
  {
    id: "humor-without-mock",
    dimension: "emotionalBalance",
    quick: false,
  },
  {
    id: "accept-help-reversed",
    dimension: "emotionalBalance",
    secondary: "listening",
    quick: false,
    stageAware: true,
  },
  {
    id: "repair-after-friction",
    dimension: "emotionalBalance",
    secondary: "listening",
    quick: false,
    weight: 1.3,
  },
  {
    id: "protect-from-burnout",
    dimension: "emotionalBalance",
    quick: false,
    stageAware: true,
    weight: 1.3,
  },
  {
    id: "gratitude-spoken",
    dimension: "presence",
    secondary: "emotionalBalance",
    quick: false,
  },
  {
    id: "future-care-talk",
    dimension: "emotionalBalance",
    secondary: "presence",
    quick: false,
    stageAware: true,
    weight: 1.2,
  },
  {
    id: "respect-their-autonomy",
    dimension: "listening",
    secondary: "emotionalBalance",
    quick: false,
    stageAware: true,
    weight: 1.3,
  },
];

export function getParentQuestionsForMode(
  mode: "quick" | "full",
): ParentQuestion[] {
  if (mode === "quick") {
    return PARENT_QUESTIONS.filter((q) => q.quick);
  }
  return PARENT_QUESTIONS;
}
