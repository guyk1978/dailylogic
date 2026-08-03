import type { DogQuestion } from "./types";

/**
 * Readiness quiz (~10). Copy in locales:
 * questions.{id}.prompt
 * questions.{id}.options.{1-5}
 * questions.{id}.byAge.{age}
 * questions.{id}.bySize.{size}
 */
export const DOG_QUESTIONS: DogQuestion[] = [
  {
    id: "rainy-walks",
    dimension: "timeReadiness",
    weight: 1.3,
  },
  {
    id: "daily-minutes",
    dimension: "timeReadiness",
    secondary: "commitment",
    weight: 1.3,
    sizeAware: true,
  },
  {
    id: "vet-bill-jump",
    dimension: "budgetBuffer",
    weight: 1.5,
  },
  {
    id: "monthly-buffer",
    dimension: "budgetBuffer",
    secondary: "commitment",
    weight: 1.3,
  },
  {
    id: "space-ok",
    dimension: "spaceLifestyle",
    weight: 1.2,
    sizeAware: true,
  },
  {
    id: "alone-plan",
    dimension: "spaceLifestyle",
    secondary: "timeReadiness",
    weight: 1.3,
  },
  {
    id: "travel-cover",
    dimension: "commitment",
    secondary: "budgetBuffer",
    weight: 1.2,
  },
  {
    id: "years-ahead",
    dimension: "commitment",
    weight: 1.4,
    ageAware: true,
  },
  {
    id: "training-patience",
    dimension: "timeReadiness",
    secondary: "commitment",
    ageAware: true,
  },
  {
    id: "family-aligned",
    dimension: "spaceLifestyle",
    secondary: "commitment",
    weight: 1.2,
  },
];

export function getDogQuestions(): DogQuestion[] {
  return DOG_QUESTIONS;
}
