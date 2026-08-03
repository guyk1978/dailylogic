export type DogSize = "small" | "medium" | "large";
export type DogAge = "puppy" | "adult" | "senior";
export type AlonePattern = "homeMostly" | "mixed" | "aloneOften";
export type GroomingNeed = "low" | "regular";
export type TrainingPlan = "none" | "planned" | "active";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type DogDimension =
  | "timeReadiness"
  | "budgetBuffer"
  | "spaceLifestyle"
  | "commitment";

export interface DogSetup {
  size: DogSize;
  age: DogAge;
  alone: AlonePattern;
  grooming: GroomingNeed;
  training: TrainingPlan;
}

export interface DogQuestion {
  id: string;
  dimension: DogDimension;
  secondary?: DogDimension;
  weight?: number;
  /** Prefer questions.{id}.byAge.{age} when present. */
  ageAware?: boolean;
  /** Prefer questions.{id}.bySize.{size} when present. */
  sizeAware?: boolean;
}

export interface CostLine {
  id: string;
  amount: number;
}

export interface DogCostBreakdown {
  monthly: CostLine[];
  annual: CostLine[];
  oneTime: CostLine[];
  monthlyTotal: number;
  annualTotal: number;
  /** Annual recurring + monthly×12 */
  yearlyForecast: number;
  oneTimeTotal: number;
  /** Suggested monthly set-aside including emergency buffer */
  recommendedMonthly: number;
}

export interface DogDimensionScore {
  dimension: DogDimension;
  score: number;
  band: "needs-care" | "developing" | "steady" | "strong";
}

export interface DogProfile {
  setup: DogSetup;
  costs: DogCostBreakdown;
  overall: number;
  overallBand: DogDimensionScore["band"];
  dimensions: DogDimensionScore[];
  profileId: string;
  insightIds: string[];
  tipIds: string[];
  seed: number;
}

export type DogAnswers = Record<string, LikertValue>;
