export type BusinessMode = "quick" | "full";

export type PartnershipStatus = "active" | "considering";
export type PartnerCount = "2" | "3" | "4plus";
export type BusinessIndustry =
  | "tech"
  | "commerce"
  | "services"
  | "food"
  | "other";
export type EquitySplit = "equal" | "majority" | "complex";

export type BusinessDimension =
  | "opsResilience"
  | "financialAlignment"
  | "conflictGovernance"
  | "workloadClarity";

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface BusinessSetup {
  status: PartnershipStatus;
  partners: PartnerCount;
  industry: BusinessIndustry;
  equity: EquitySplit;
}

export interface BusinessQuestion {
  id: string;
  dimension: BusinessDimension;
  secondary?: BusinessDimension;
  quick: boolean;
  weight?: number;
  /** When true, UI prefers questions.{id}.byIndustry.{industry} if present. */
  industryAware?: boolean;
}

export interface BusinessDimensionScore {
  dimension: BusinessDimension;
  score: number;
  band: "needs-care" | "developing" | "steady" | "strong";
}

export interface BusinessProfile {
  mode: BusinessMode;
  setup: BusinessSetup;
  overall: number;
  overallBand: BusinessDimensionScore["band"];
  dimensions: BusinessDimensionScore[];
  profileId: string;
  insightIds: string[];
  tipIds: string[];
  agreementIds: string[];
  seed: number;
}

export type BusinessAnswers = Record<string, LikertValue>;
