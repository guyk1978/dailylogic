export type MentalMode = "quick" | "full";

export type PeriodLoad = "highPressure" | "routine" | "transition";
export type FatigueLevel = "rested" | "midweek" | "wornDown";
export type AttentionFocus =
  | "timePressure"
  | "futureWorry"
  | "taskPile"
  | "seekingQuiet";

export type MentalDimension = "stressBalance" | "restEnergy" | "personalSpace";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface MentalSetup {
  period: PeriodLoad;
  fatigue: FatigueLevel;
  focus: AttentionFocus;
}

export interface MentalQuestion {
  id: string;
  dimension: MentalDimension;
  secondary?: MentalDimension;
  quick: boolean;
  weight?: number;
  /** Prefer questions.{id}.byPeriod.{period} when present. */
  periodAware?: boolean;
  /** Prefer questions.{id}.byFatigue.{fatigue} when present. */
  fatigueAware?: boolean;
  /** Prefer questions.{id}.byFocus.{focus} when present. */
  focusAware?: boolean;
}

export interface MentalDimensionScore {
  dimension: MentalDimension;
  score: number;
  band: "needs-care" | "developing" | "steady" | "strong";
}

export interface MentalProfile {
  mode: MentalMode;
  setup: MentalSetup;
  overall: number;
  overallBand: MentalDimensionScore["band"];
  dimensions: MentalDimensionScore[];
  profileId: string;
  insightIds: string[];
  tipIds: string[];
  seed: number;
}

export type MentalAnswers = Record<string, LikertValue>;
