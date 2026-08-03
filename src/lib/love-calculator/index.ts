export type {
  CalculatorMode,
  InsightBand,
  InsightTemplate,
  LoveInputCategoryId,
  LoveInputDef,
  LoveMoodDef,
  LoveSelection,
  LoveTraitKey,
  LoveTraits,
  MatchupRelation,
  MatchupResult,
  SynergyResult,
  TimeOfDay,
  WeeklyReportResult,
} from "./types";

export {
  LOVE_INPUTS,
  LOVE_INPUT_CATEGORY_ORDER,
  LOVE_MOODS,
  getInputsByCategory,
  getLoveInput,
  getLoveMood,
} from "./inputs-data";

export {
  INSIGHT_TEMPLATES,
  MATCHUP_INSIGHT_IDS,
  WEEKLY_SUMMARY_IDS,
  WEEKLY_TITLE_IDS,
} from "./insights-data";

export {
  computeMatchup,
  computeSynergy,
  computeWeeklyReport,
  getTimeOfDay,
  hashString,
  mulberry32,
  pickInsightId,
  pickMatchupInsightId,
  pickTimeNoteId,
  rankInsights,
  scoreToBand,
} from "./engine";

export {
  copyShareCardImage,
  downloadShareCard,
  renderShareCardPng,
  type ShareCardPayload,
} from "./share-card";
