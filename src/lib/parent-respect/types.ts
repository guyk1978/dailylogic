export type ParentMode = "quick" | "full";

export type LivingDistance = "sameArea" | "shortDrive" | "farAway";
export type ContactPattern = "daily" | "fewWeekly" | "weekends" | "mostlyPhone";
export type ParentStage = "independent" | "someHelp" | "caregiving";

export type ParentDimension =
  | "presence"
  | "listening"
  | "emotionalBalance";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface ParentSetup {
  distance: LivingDistance;
  contact: ContactPattern;
  stage: ParentStage;
}

export interface ParentQuestion {
  id: string;
  dimension: ParentDimension;
  secondary?: ParentDimension;
  quick: boolean;
  weight?: number;
  /** Prefer questions.{id}.byDistance.{distance} when present. */
  distanceAware?: boolean;
  /** Prefer questions.{id}.byStage.{stage} when present. */
  stageAware?: boolean;
}

export interface ParentDimensionScore {
  dimension: ParentDimension;
  score: number;
  band: "needs-care" | "developing" | "steady" | "strong";
}

export interface ParentProfile {
  mode: ParentMode;
  setup: ParentSetup;
  overall: number;
  overallBand: ParentDimensionScore["band"];
  dimensions: ParentDimensionScore[];
  profileId: string;
  insightIds: string[];
  tipIds: string[];
  seed: number;
}

export type ParentAnswers = Record<string, LikertValue>;
