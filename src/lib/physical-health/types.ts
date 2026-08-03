export type BiologicalSex = "female" | "male";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "regular"
  | "intense";

export type NutritionQuality =
  | "needsWork"
  | "mixed"
  | "mostlyGood"
  | "strong";

export type PhysicalDimension =
  | "energyBalance"
  | "recoveryQuality"
  | "activityRhythm";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface PhysicalSetup {
  heightCm: number;
  weightKg: number;
  age: number;
  sex: BiologicalSex;
  activity: ActivityLevel;
  sleepHours: number;
  nutrition: NutritionQuality;
}

export interface BodyMetrics {
  bmi: number;
  bmiBand: "under" | "healthy" | "high" | "higher";
  bmr: number;
  tdee: number;
  sleepBand: "short" | "fair" | "good" | "long";
}

export interface PhysicalQuestion {
  id: string;
  dimension: PhysicalDimension;
  secondary?: PhysicalDimension;
  weight?: number;
  activityAware?: boolean;
  sleepAware?: boolean;
}

export interface PhysicalDimensionScore {
  dimension: PhysicalDimension;
  score: number;
  band: "needs-care" | "developing" | "steady" | "strong";
}

export interface PhysicalProfile {
  setup: PhysicalSetup;
  metrics: BodyMetrics;
  overall: number;
  overallBand: PhysicalDimensionScore["band"];
  dimensions: PhysicalDimensionScore[];
  profileId: string;
  insightIds: string[];
  tipIds: string[];
  seed: number;
}

export type PhysicalAnswers = Record<string, LikertValue>;
