export type StrangerMode = "quick" | "full";

export type ConversationPlace =
  | "flight"
  | "queue"
  | "networking"
  | "socialOnline";

export type CounterpartType = "pleasant" | "prying" | "professional";

export type ConversationGoal =
  | "survivePolitely"
  | "warmButGuarded"
  | "checkBoundaries";

export type StrangerDimension =
  | "privacyGuard"
  | "socialGrace"
  | "gutInstinct";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface StrangerSetup {
  place: ConversationPlace;
  counterpart: CounterpartType;
  goal: ConversationGoal;
}

export interface StrangerQuestion {
  id: string;
  dimension: StrangerDimension;
  secondary?: StrangerDimension;
  quick: boolean;
  weight?: number;
  /** Prefer questions.{id}.byPlace.{place} when present. */
  placeAware?: boolean;
  /** Prefer questions.{id}.byCounterpart.{counterpart} when present. */
  counterpartAware?: boolean;
}

export interface StrangerDimensionScore {
  dimension: StrangerDimension;
  score: number;
  band: "needs-care" | "developing" | "steady" | "strong";
}

export interface StrangerProfile {
  mode: StrangerMode;
  setup: StrangerSetup;
  overall: number;
  overallBand: StrangerDimensionScore["band"];
  dimensions: StrangerDimensionScore[];
  profileId: string;
  insightIds: string[];
  tipIds: string[];
  seed: number;
}

export type StrangerAnswers = Record<string, LikertValue>;
