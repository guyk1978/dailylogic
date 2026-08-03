export type {
  ActivityBurnLine,
  ActivityCategory,
  ActivityDefinition,
  ActivityId,
  ActivitySelection,
  BiologicalSex,
  CalorieBurnResult,
  CalorieProfile,
  WeightUnit,
} from "./types";

export {
  ACTIVITY_CATEGORY_ORDER,
  CALORIE_ACTIVITIES,
  getActivity,
} from "./activities";

export {
  analyzeCalorieBurn,
  caloriesForActivity,
  estimateBmr,
  isCalorieProfileComplete,
  kgToLb,
  lbToKg,
  normalizeWeightToKg,
} from "./engine";

export {
  copyCalorieCardImage,
  downloadCalorieCard,
  renderCalorieSharePng,
  type CalorieSharePayload,
} from "./share-card";
