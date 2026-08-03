export type {
  AlonePattern,
  DogAge,
  DogAnswers,
  DogCostBreakdown,
  DogDimension,
  DogDimensionScore,
  DogProfile,
  DogQuestion,
  DogSetup,
  DogSize,
  GroomingNeed,
  LikertValue,
  TrainingPlan,
  CostLine,
} from "./types";

export { calculateDogCosts } from "./costs";
export { DOG_QUESTIONS, getDogQuestions } from "./questions";
export {
  analyzeDogOwnership,
  isDogSetupComplete,
} from "./engine";
export {
  copyDogCardImage,
  downloadDogCard,
  renderDogSharePng,
  type DogSharePayload,
} from "./share-card";
