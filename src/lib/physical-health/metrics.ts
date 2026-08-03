import type { BodyMetrics, PhysicalSetup } from "./types";

const ACTIVITY_FACTOR: Record<PhysicalSetup["activity"], number> = {
  sedentary: 1.2,
  light: 1.375,
  regular: 1.55,
  intense: 1.725,
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** BMI = kg / m² */
export function calculateBmi(heightCm: number, weightKg: number): number {
  const meters = heightCm / 100;
  if (meters <= 0) return 0;
  return Math.round((weightKg / (meters * meters)) * 10) / 10;
}

export function bmiBand(bmi: number): BodyMetrics["bmiBand"] {
  if (bmi < 18.5) return "under";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "high";
  return "higher";
}

/** Mifflin–St Jeor resting energy estimate (kcal/day) */
export function calculateBmr(setup: PhysicalSetup): number {
  const { weightKg, heightCm, age, sex } = setup;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const raw = sex === "male" ? base + 5 : base - 161;
  return Math.round(clamp(raw, 800, 4000));
}

export function calculateTdee(setup: PhysicalSetup, bmr: number): number {
  return Math.round(bmr * ACTIVITY_FACTOR[setup.activity]);
}

export function sleepBand(hours: number): BodyMetrics["sleepBand"] {
  if (hours < 6) return "short";
  if (hours < 7) return "fair";
  if (hours <= 9) return "good";
  return "long";
}

export function calculateBodyMetrics(setup: PhysicalSetup): BodyMetrics {
  const bmi = calculateBmi(setup.heightCm, setup.weightKg);
  const bmr = calculateBmr(setup);
  return {
    bmi,
    bmiBand: bmiBand(bmi),
    bmr,
    tdee: calculateTdee(setup, bmr),
    sleepBand: sleepBand(setup.sleepHours),
  };
}

export function isPhysicalSetupComplete(
  setup: Partial<PhysicalSetup>,
): setup is PhysicalSetup {
  return (
    typeof setup.heightCm === "number" &&
    setup.heightCm >= 120 &&
    setup.heightCm <= 230 &&
    typeof setup.weightKg === "number" &&
    setup.weightKg >= 35 &&
    setup.weightKg <= 250 &&
    typeof setup.age === "number" &&
    setup.age >= 14 &&
    setup.age <= 100 &&
    Boolean(setup.sex) &&
    Boolean(setup.activity) &&
    typeof setup.sleepHours === "number" &&
    setup.sleepHours >= 3 &&
    setup.sleepHours <= 14 &&
    Boolean(setup.nutrition)
  );
}
