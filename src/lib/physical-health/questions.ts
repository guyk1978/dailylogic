import type { PhysicalQuestion } from "./types";

/**
 * Short lifestyle check (~10). Copy in locales:
 * questions.{id}.prompt
 * questions.{id}.options.{1-5}
 * questions.{id}.byActivity.{activity}
 * questions.{id}.bySleep.{sleepBand}
 */
export const PHYSICAL_QUESTIONS: PhysicalQuestion[] = [
  {
    id: "daytime-energy",
    dimension: "energyBalance",
    weight: 1.4,
  },
  {
    id: "water-habit",
    dimension: "energyBalance",
    weight: 1.1,
  },
  {
    id: "afternoon-slump",
    dimension: "energyBalance",
    secondary: "recoveryQuality",
    weight: 1.2,
  },
  {
    id: "steady-meals",
    dimension: "energyBalance",
    weight: 1.2,
  },
  {
    id: "wake-feeling",
    dimension: "recoveryQuality",
    weight: 1.4,
    sleepAware: true,
  },
  {
    id: "sore-recovery",
    dimension: "recoveryQuality",
    secondary: "activityRhythm",
    weight: 1.2,
    activityAware: true,
  },
  {
    id: "rest-day-respect",
    dimension: "recoveryQuality",
    weight: 1.2,
    activityAware: true,
  },
  {
    id: "move-most-days",
    dimension: "activityRhythm",
    weight: 1.4,
    activityAware: true,
  },
  {
    id: "strength-feel",
    dimension: "activityRhythm",
    secondary: "energyBalance",
    weight: 1.2,
  },
  {
    id: "chronic-fatigue-edge",
    dimension: "recoveryQuality",
    secondary: "energyBalance",
    weight: 1.3,
  },
];

export function getPhysicalQuestions(): PhysicalQuestion[] {
  return PHYSICAL_QUESTIONS;
}
