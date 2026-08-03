import { getActivity } from "./activities";
import type {
  ActivityBurnLine,
  ActivitySelection,
  BiologicalSex,
  CalorieBurnResult,
  CalorieProfile,
  WeightUnit,
} from "./types";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function lbToKg(lb: number): number {
  return lb * 0.45359237;
}

export function kgToLb(kg: number): number {
  return kg / 0.45359237;
}

export function normalizeWeightToKg(
  value: number,
  unit: WeightUnit,
): number {
  const raw = unit === "lb" ? lbToKg(value) : value;
  return Math.round(clamp(raw, 35, 250) * 10) / 10;
}

/**
 * Mifflin–St Jeor with typical height defaults when height is unknown.
 * Used only as a calm resting-energy reference — not a medical measure.
 */
export function estimateBmr(
  weightKg: number,
  age: number,
  sex: BiologicalSex,
): number {
  const heightCm = sex === "male" ? 175 : 162;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const raw = sex === "male" ? base + 5 : base - 161;
  return Math.round(clamp(raw, 800, 4000));
}

/** kcal ≈ MET × body weight (kg) × duration (hours) */
export function caloriesForActivity(
  met: number,
  weightKg: number,
  minutes: number,
): number {
  if (met <= 0 || weightKg <= 0 || minutes <= 0) return 0;
  const hours = minutes / 60;
  return Math.round(met * weightKg * hours);
}

export function isCalorieProfileComplete(
  profile: Partial<CalorieProfile>,
): profile is CalorieProfile {
  return (
    typeof profile.weightKg === "number" &&
    profile.weightKg >= 35 &&
    profile.weightKg <= 250 &&
    typeof profile.age === "number" &&
    profile.age >= 14 &&
    profile.age <= 100 &&
    (profile.sex === "female" || profile.sex === "male") &&
    (profile.weightUnit === "kg" || profile.weightUnit === "lb")
  );
}

function pickTips(lines: ActivityBurnLine[], totalMinutes: number): string[] {
  const ids = new Set<string>(["consistency", "listen"]);
  const categories = new Set(
    lines.map((line) => getActivity(line.activityId)?.category),
  );
  if (categories.size >= 2) ids.add("mix");
  else ids.add("mix");
  if (totalMinutes >= 45 || lines.some((l) => l.met >= 8)) ids.add("recover");
  else ids.add("recover");
  return ["mix", "recover", "consistency", "listen"].filter((id) =>
    ids.has(id),
  );
}

export function analyzeCalorieBurn(
  profile: CalorieProfile,
  selections: ActivitySelection[],
): CalorieBurnResult | null {
  if (!isCalorieProfileComplete(profile)) return null;

  const lines: ActivityBurnLine[] = [];
  for (const sel of selections) {
    const def = getActivity(sel.activityId);
    if (!def) continue;
    const minutes = clamp(Math.round(sel.minutes), 1, 600);
    const kcal = caloriesForActivity(def.met, profile.weightKg, minutes);
    if (kcal <= 0) continue;
    lines.push({
      activityId: sel.activityId,
      minutes,
      met: def.met,
      kcal,
      kcalPerMinute: Math.round((kcal / minutes) * 10) / 10,
    });
  }

  if (lines.length === 0) return null;

  const totalKcal = lines.reduce((sum, line) => sum + line.kcal, 0);
  const totalMinutes = lines.reduce((sum, line) => sum + line.minutes, 0);
  const avgKcalPerMinute =
    totalMinutes > 0
      ? Math.round((totalKcal / totalMinutes) * 10) / 10
      : 0;

  return {
    profile,
    bmr: estimateBmr(profile.weightKg, profile.age, profile.sex),
    lines,
    totalKcal,
    totalMinutes,
    avgKcalPerMinute,
    tipIds: pickTips(lines, totalMinutes),
  };
}
