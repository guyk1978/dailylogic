import { calculateBodyMetrics } from "./metrics";
import { getPhysicalQuestions } from "./questions";
import type {
  LikertValue,
  PhysicalAnswers,
  PhysicalDimension,
  PhysicalDimensionScore,
  PhysicalProfile,
  PhysicalSetup,
} from "./types";

const DIMENSIONS: PhysicalDimension[] = [
  "energyBalance",
  "recoveryQuality",
  "activityRhythm",
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function scoreToBand(score: number): PhysicalDimensionScore["band"] {
  if (score >= 82) return "strong";
  if (score >= 68) return "steady";
  if (score >= 52) return "developing";
  return "needs-care";
}

function likertToPercent(value: LikertValue): number {
  return ((value - 1) / 4) * 100;
}

function setupBias(setup: PhysicalSetup, dimension: PhysicalDimension): number {
  const metrics = calculateBodyMetrics(setup);
  let bias = 0;

  if (dimension === "energyBalance") {
    if (metrics.bmiBand === "healthy") bias += 2;
    if (metrics.bmiBand === "under" || metrics.bmiBand === "higher") bias -= 2;
    if (metrics.bmiBand === "high") bias -= 1;
    if (setup.nutrition === "strong") bias += 2;
    if (setup.nutrition === "mostlyGood") bias += 1;
    if (setup.nutrition === "needsWork") bias -= 2;
    if (setup.nutrition === "mixed") bias -= 0.5;
  }

  if (dimension === "recoveryQuality") {
    if (metrics.sleepBand === "good") bias += 3;
    if (metrics.sleepBand === "fair") bias += 0.5;
    if (metrics.sleepBand === "short") bias -= 3;
    if (metrics.sleepBand === "long") bias -= 0.5;
  }

  if (dimension === "activityRhythm") {
    if (setup.activity === "sedentary") bias -= 3;
    if (setup.activity === "light") bias -= 0.5;
    if (setup.activity === "regular") bias += 2;
    if (setup.activity === "intense") bias += 2.5;
  }

  return bias;
}

export function analyzePhysicalHealth(
  setup: PhysicalSetup,
  answers: PhysicalAnswers,
): PhysicalProfile | null {
  const questions = getPhysicalQuestions();
  if (questions.some((q) => answers[q.id] === undefined)) return null;

  const metrics = calculateBodyMetrics(setup);

  const totals: Record<PhysicalDimension, { sum: number; weight: number }> = {
    energyBalance: { sum: 0, weight: 0 },
    recoveryQuality: { sum: 0, weight: 0 },
    activityRhythm: { sum: 0, weight: 0 },
  };

  for (const question of questions) {
    const value = answers[question.id]!;
    const percent = likertToPercent(value);
    const weight = question.weight ?? 1;
    totals[question.dimension].sum += percent * weight;
    totals[question.dimension].weight += weight;
    if (question.secondary) {
      const half = weight * 0.45;
      totals[question.secondary].sum += percent * half;
      totals[question.secondary].weight += half;
    }
  }

  const dimensions: PhysicalDimensionScore[] = DIMENSIONS.map((dimension) => {
    const bucket = totals[dimension];
    const raw = bucket.weight > 0 ? bucket.sum / bucket.weight : 50;
    const score =
      Math.round(clamp(raw + setupBias(setup, dimension), 0, 100) * 10) / 10;
    return { dimension, score, band: scoreToBand(score) };
  });

  const overall =
    Math.round(
      (dimensions.reduce((sum, item) => sum + item.score, 0) /
        dimensions.length) *
        10,
    ) / 10;
  const overallBand = scoreToBand(overall);

  const seed = hashString(
    `${setup.heightCm}|${setup.weightKg}|${setup.age}|${setup.sex}|${setup.activity}|${setup.sleepHours}|${setup.nutrition}|${questions
      .map((q) => `${q.id}:${answers[q.id]}`)
      .join("|")}`,
  );
  const rand = mulberry32(seed);

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest = sorted[0]!;
  const strongest = sorted[sorted.length - 1]!;

  const profilePool =
    overallBand === "strong"
      ? ["vital-steady", "active-balanced", "strong-foundation"]
      : overallBand === "steady"
        ? ["mostly-vital", "building-habits", "solid-enough"]
        : overallBand === "developing"
          ? ["needs-rhythm", "tired-edges", "light-move-start"]
          : ["reset-gently", "sleep-first", "one-habit-week"];

  const profileId = profilePool[Math.floor(rand() * profilePool.length)]!;

  const insightIds = [
    `dim-${strongest.dimension}-high`,
    `dim-${weakest.dimension}-low`,
    `overall-${overallBand}`,
    `bmi-${metrics.bmiBand}`,
    `sleep-${metrics.sleepBand}`,
    `activity-${setup.activity}`,
    `nutrition-${setup.nutrition}`,
  ].slice(0, 3 + Math.floor(rand() * 2));

  const tipByWeak: Record<PhysicalDimension, string[]> = {
    energyBalance: [
      "tip-water-bottle",
      "tip-protein-breakfast",
      "tip-walk-after-lunch",
    ],
    recoveryQuality: [
      "tip-earlier-bed",
      "tip-screen-off",
      "tip-rest-day",
    ],
    activityRhythm: [
      "tip-ten-minute-move",
      "tip-stairs-choice",
      "tip-calendar-workout",
    ],
  };

  const tipIds = [
    tipByWeak[weakest.dimension][Math.floor(rand() * 3)]!,
    tipByWeak[strongest.dimension][Math.floor(rand() * 3)]!,
    "tip-weekly-check",
    metrics.sleepBand === "short" ? "tip-sleep-window" : "tip-outdoor-light",
  ].filter((id, i, arr) => arr.indexOf(id) === i);

  return {
    setup,
    metrics,
    overall,
    overallBand,
    dimensions,
    profileId,
    insightIds,
    tipIds,
    seed,
  };
}
