import type { StrangerQuestion } from "./types";

/**
 * Question bank. Copy in locales:
 * questions.{id}.prompt
 * questions.{id}.options.{1-5}
 * questions.{id}.byPlace.{place}
 * questions.{id}.byCounterpart.{counterpart}
 */
export const STRANGER_QUESTIONS: StrangerQuestion[] = [
  // —— Privacy guard ——
  {
    id: "work-crisis-share",
    dimension: "privacyGuard",
    quick: true,
    weight: 1.4,
    placeAware: true,
  },
  {
    id: "family-drama-line",
    dimension: "privacyGuard",
    quick: true,
    weight: 1.3,
  },
  {
    id: "money-health-details",
    dimension: "privacyGuard",
    quick: true,
    weight: 1.3,
  },
  {
    id: "location-routines",
    dimension: "privacyGuard",
    secondary: "gutInstinct",
    quick: false,
    placeAware: true,
  },
  {
    id: "kids-school-info",
    dimension: "privacyGuard",
    quick: false,
  },
  {
    id: "passwords-or-accounts",
    dimension: "privacyGuard",
    weight: 1.5,
    quick: false,
  },
  {
    id: "photos-and-screens",
    dimension: "privacyGuard",
    secondary: "socialGrace",
    quick: false,
    placeAware: true,
  },
  {
    id: "ex-and-intimacy",
    dimension: "privacyGuard",
    quick: false,
  },

  // —— Social grace ——
  {
    id: "exit-politics",
    dimension: "socialGrace",
    quick: true,
    weight: 1.3,
    counterpartAware: true,
  },
  {
    id: "deflect-personal-q",
    dimension: "socialGrace",
    secondary: "privacyGuard",
    quick: true,
    weight: 1.4,
    counterpartAware: true,
  },
  {
    id: "match-their-depth",
    dimension: "socialGrace",
    quick: true,
  },
  {
    id: "change-topic-smooth",
    dimension: "socialGrace",
    quick: true,
  },
  {
    id: "humor-without-overshare",
    dimension: "socialGrace",
    secondary: "privacyGuard",
    quick: false,
  },
  {
    id: "end-conversation-kind",
    dimension: "socialGrace",
    quick: false,
    placeAware: true,
  },
  {
    id: "networking-vs-therapy",
    dimension: "socialGrace",
    secondary: "privacyGuard",
    quick: false,
    counterpartAware: true,
  },
  {
    id: "online-dm-pace",
    dimension: "socialGrace",
    secondary: "gutInstinct",
    quick: false,
    placeAware: true,
  },

  // —— Gut instinct ——
  {
    id: "body-says-no",
    dimension: "gutInstinct",
    quick: true,
    weight: 1.4,
  },
  {
    id: "too-many-questions",
    dimension: "gutInstinct",
    secondary: "privacyGuard",
    quick: true,
    weight: 1.3,
    counterpartAware: true,
  },
  {
    id: "flattery-for-info",
    dimension: "gutInstinct",
    secondary: "privacyGuard",
    quick: true,
    weight: 1.3,
  },
  {
    id: "alcohol-loosens",
    dimension: "gutInstinct",
    quick: false,
  },
  {
    id: "recording-or-audience",
    dimension: "gutInstinct",
    secondary: "privacyGuard",
    quick: false,
    placeAware: true,
  },
  {
    id: "follow-up-contact",
    dimension: "gutInstinct",
    secondary: "socialGrace",
    quick: false,
    counterpartAware: true,
  },
  {
    id: "share-to-fill-silence",
    dimension: "gutInstinct",
    secondary: "privacyGuard",
    quick: false,
  },
  {
    id: "regret-after-chat",
    dimension: "gutInstinct",
    quick: false,
    weight: 1.2,
  },
  {
    id: "third-party-gossip",
    dimension: "privacyGuard",
    secondary: "socialGrace",
    quick: false,
  },
  {
    id: "professional-secrets",
    dimension: "privacyGuard",
    secondary: "socialGrace",
    quick: false,
    counterpartAware: true,
    weight: 1.3,
  },
  {
    id: "emotional-dump",
    dimension: "privacyGuard",
    secondary: "gutInstinct",
    quick: false,
    weight: 1.3,
  },
  {
    id: "ask-before-advise",
    dimension: "socialGrace",
    quick: false,
  },
  {
    id: "public-place-volume",
    dimension: "privacyGuard",
    secondary: "gutInstinct",
    quick: false,
    placeAware: true,
  },
  {
    id: "leave-with-dignity",
    dimension: "socialGrace",
    secondary: "gutInstinct",
    quick: false,
    weight: 1.2,
  },
];

export function getStrangerQuestionsForMode(
  mode: "quick" | "full",
): StrangerQuestion[] {
  if (mode === "quick") {
    return STRANGER_QUESTIONS.filter((q) => q.quick);
  }
  return STRANGER_QUESTIONS;
}
