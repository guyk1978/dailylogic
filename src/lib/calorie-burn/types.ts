export type BiologicalSex = "female" | "male";
export type WeightUnit = "kg" | "lb";

export type ActivityCategory =
  | "cardio"
  | "strength"
  | "mindBody"
  | "daily"
  | "sport";

export type ActivityId =
  | "walking"
  | "briskWalk"
  | "jogging"
  | "running"
  | "cycling"
  | "swimming"
  | "jumpRope"
  | "hiit"
  | "strength"
  | "yoga"
  | "pilates"
  | "dance"
  | "hiking"
  | "rowing"
  | "stairs"
  | "housework"
  | "soccer"
  | "basketball"
  | "tennis"
  | "elliptical";

export interface ActivityDefinition {
  id: ActivityId;
  /** Metabolic Equivalent of Task (Compendium-style) */
  met: number;
  category: ActivityCategory;
}

export interface CalorieProfile {
  weightKg: number;
  age: number;
  sex: BiologicalSex;
  /** UI preference only — storage always keeps kg */
  weightUnit: WeightUnit;
}

export interface ActivitySelection {
  activityId: ActivityId;
  minutes: number;
}

export interface ActivityBurnLine {
  activityId: ActivityId;
  minutes: number;
  met: number;
  kcal: number;
  kcalPerMinute: number;
}

export interface CalorieBurnResult {
  profile: CalorieProfile;
  bmr: number;
  lines: ActivityBurnLine[];
  totalKcal: number;
  totalMinutes: number;
  avgKcalPerMinute: number;
  tipIds: string[];
}
