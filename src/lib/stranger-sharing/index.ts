export type {
  ConversationGoal,
  ConversationPlace,
  CounterpartType,
  LikertValue,
  StrangerAnswers,
  StrangerDimension,
  StrangerDimensionScore,
  StrangerMode,
  StrangerProfile,
  StrangerQuestion,
  StrangerSetup,
} from "./types";

export {
  STRANGER_QUESTIONS,
  getStrangerQuestionsForMode,
} from "./questions";

export {
  analyzeStrangerSharing,
  isStrangerSetupComplete,
} from "./engine";

export {
  copyStrangerCardImage,
  downloadStrangerCard,
  renderStrangerSharePng,
  type StrangerSharePayload,
} from "./share-card";
