export type PocketMode = "quick" | "full";

export type AgeGroup = "young" | "tween" | "teen";
export type AllowanceModel = "fixed" | "chores" | "hybrid";
export type PrimaryGoal = "delay" | "save-goal" | "independence" | "value";

export type PocketDimension =
  | "moneyResponsibility"
  | "savingDiscipline"
  | "familyPartnership"
  | "spendingWisdom";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface PocketSetup {
  age: AgeGroup;
  model: AllowanceModel;
  goal: PrimaryGoal;
}

export interface PocketQuestion {
  id: string;
  dimension: PocketDimension;
  secondary?: PocketDimension;
  quick: boolean;
  weight?: number;
  /** Prefer questions.{id}.byAge.{age} when present. */
  ageAware?: boolean;
  /** Prefer questions.{id}.byModel.{model} when present. */
  modelAware?: boolean;
}

export interface PocketDimensionScore {
  dimension: PocketDimension;
  score: number;
  band: "needs-care" | "developing" | "steady" | "strong";
}

export interface PocketSplit {
  spend: number;
  save: number;
  give: number;
}

export interface RecommendedAmount {
  min: number;
  mid: number;
  max: number;
}

export interface PocketProfile {
  mode: PocketMode;
  setup: PocketSetup;
  overall: number;
  overallBand: PocketDimensionScore["band"];
  dimensions: PocketDimensionScore[];
  profileId: string;
  insightIds: string[];
  tipIds: string[];
  habitIds: string[];
  recommendedAmount: RecommendedAmount;
  split: PocketSplit;
  seed: number;
}

export type PocketAnswers = Record<string, LikertValue>;
