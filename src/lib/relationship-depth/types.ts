export type RelationshipMode = "quick" | "full";

export type RelationshipDimension =
  | "resilience"
  | "communication"
  | "personalSpace"
  | "sharedGrowth";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface RelationshipQuestion {
  id: string;
  /** Primary dimension this answer feeds. */
  dimension: RelationshipDimension;
  /** Optional secondary pull (half weight). */
  secondary?: RelationshipDimension;
  /** Include in quick mode (~10). Full mode includes all. */
  quick: boolean;
  weight?: number;
}

export interface DimensionScore {
  dimension: RelationshipDimension;
  score: number;
  band: "needs-care" | "developing" | "steady" | "strong";
}

export interface RelationshipProfile {
  mode: RelationshipMode;
  overall: number;
  overallBand: DimensionScore["band"];
  dimensions: DimensionScore[];
  profileId: string;
  insightIds: string[];
  tipIds: string[];
  seed: number;
}

export type RelationshipAnswers = Record<string, LikertValue>;
