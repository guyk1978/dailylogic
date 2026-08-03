export type {
  ActivityLevel,
  BiologicalSex,
  BodyMetrics,
  LikertValue,
  NutritionQuality,
  PhysicalAnswers,
  PhysicalDimension,
  PhysicalDimensionScore,
  PhysicalProfile,
  PhysicalQuestion,
  PhysicalSetup,
} from "./types";

export {
  PHYSICAL_QUESTIONS,
  getPhysicalQuestions,
} from "./questions";

export {
  calculateBmi,
  calculateBmr,
  calculateBodyMetrics,
  calculateTdee,
  isPhysicalSetupComplete,
  sleepBand,
} from "./metrics";

export { analyzePhysicalHealth } from "./engine";

export {
  copyPhysicalCardImage,
  downloadPhysicalCard,
  renderPhysicalSharePng,
  type PhysicalSharePayload,
} from "./share-card";
