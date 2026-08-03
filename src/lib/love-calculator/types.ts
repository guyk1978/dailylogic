export type LoveInputCategoryId =
  | "food"
  | "home"
  | "habits"
  | "stuff"
  | "moments"
  | "outdoors";

export type LoveTraitKey =
  | "energy"
  | "chaos"
  | "comfort"
  | "social"
  | "indulgence";

export type LoveTraits = Record<LoveTraitKey, number>;

export interface LoveInputDef {
  id: string;
  category: LoveInputCategoryId;
  /** Trait vector 0–100 used by the synergy engine. */
  traits: LoveTraits;
  tags: string[];
}

export interface LoveMoodDef {
  id: string;
  /** Modifier applied to the synergy score (−12 … +12). */
  scoreBias: number;
  traits: Partial<LoveTraits>;
  tags: string[];
}

export type InsightBand = "low" | "mid" | "high" | "legendary";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type CalculatorMode = "classic" | "matchup" | "weekly";

export type MatchupRelation = "synergy" | "friction" | "productive-friction";

export interface InsightTemplate {
  id: string;
  /** Prefer when score falls in these bands. Empty = any. */
  bands: InsightBand[];
  /** Prefer when joy/vice share any of these tags. */
  preferTags: string[];
  /** Prefer when joy+vice categories match any pair (order-insensitive). */
  preferCategoryPairs: Array<[LoveInputCategoryId, LoveInputCategoryId]>;
  /** Prefer when mood has any of these tags. */
  preferMoodTags: string[];
  /** Prefer when current time-of-day matches. */
  preferTimes?: TimeOfDay[];
}

export interface SynergyResult {
  score: number;
  band: InsightBand;
  seed: number;
  synergyLabel: string;
  traitBlend: LoveTraits;
}

export interface LoveSelection {
  joyId: string;
  viceId: string;
  moodId: string;
}

export interface MatchupResult {
  score: number;
  friction: number;
  band: InsightBand;
  relation: MatchupRelation;
  seed: number;
  traitBlend: LoveTraits;
  sharedTags: string[];
}

export interface WeeklyReportResult {
  score: number;
  band: InsightBand;
  seed: number;
  titleId: string;
  summaryId: string;
  dominantTags: string[];
  traitBlend: LoveTraits;
}
