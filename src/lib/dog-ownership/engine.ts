import { calculateDogCosts } from "./costs";
import { getDogQuestions } from "./questions";
import type {
  DogAnswers,
  DogDimension,
  DogDimensionScore,
  DogProfile,
  DogSetup,
  LikertValue,
} from "./types";

const DIMENSIONS: DogDimension[] = [
  "timeReadiness",
  "budgetBuffer",
  "spaceLifestyle",
  "commitment",
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

function scoreToBand(score: number): DogDimensionScore["band"] {
  if (score >= 82) return "strong";
  if (score >= 68) return "steady";
  if (score >= 52) return "developing";
  return "needs-care";
}

function likertToPercent(value: LikertValue): number {
  return ((value - 1) / 4) * 100;
}

function setupBias(setup: DogSetup, dimension: DogDimension): number {
  let bias = 0;
  if (setup.alone === "aloneOften" && dimension === "timeReadiness") bias -= 3;
  if (setup.alone === "homeMostly" && dimension === "timeReadiness") bias += 1;
  if (setup.age === "puppy" && dimension === "commitment") bias -= 1.5;
  if (setup.age === "senior" && dimension === "budgetBuffer") bias -= 1.5;
  if (setup.size === "large" && dimension === "spaceLifestyle") bias -= 1;
  if (setup.training === "active" && dimension === "timeReadiness") bias += 1;
  return bias;
}

export function analyzeDogOwnership(
  setup: DogSetup,
  answers: DogAnswers,
): DogProfile | null {
  const questions = getDogQuestions();
  if (questions.some((q) => answers[q.id] === undefined)) return null;

  const costs = calculateDogCosts(setup);

  const totals: Record<DogDimension, { sum: number; weight: number }> = {
    timeReadiness: { sum: 0, weight: 0 },
    budgetBuffer: { sum: 0, weight: 0 },
    spaceLifestyle: { sum: 0, weight: 0 },
    commitment: { sum: 0, weight: 0 },
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

  const dimensions: DogDimensionScore[] = DIMENSIONS.map((dimension) => {
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
    `${setup.size}|${setup.age}|${setup.alone}|${setup.grooming}|${setup.training}|${questions
      .map((q) => `${q.id}:${answers[q.id]}`)
      .join("|")}`,
  );
  const rand = mulberry32(seed);

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest = sorted[0]!;
  const strongest = sorted[sorted.length - 1]!;

  const profilePool =
    overallBand === "strong"
      ? ["ready-pack", "steady-guardian", "budget-aware"]
      : overallBand === "steady"
        ? ["almost-ready", "learning-owner", "solid-base"]
        : overallBand === "developing"
          ? ["gap-check", "plan-first", "pace-yourself"]
          : ["pause-and-prep", "not-yet", "build-buffer"];

  const profileId = profilePool[Math.floor(rand() * profilePool.length)]!;

  const insightIds = [
    `dim-${strongest.dimension}-high`,
    `dim-${weakest.dimension}-low`,
    `overall-${overallBand}`,
    `size-${setup.size}`,
    `age-${setup.age}`,
    `alone-${setup.alone}`,
  ].slice(0, 3 + Math.floor(rand() * 2));

  const tipByWeak: Record<DogDimension, string[]> = {
    timeReadiness: ["tip-walk-blocks", "tip-rain-kit", "tip-shared-shifts"],
    budgetBuffer: ["tip-emergency-jar", "tip-buy-bulk", "tip-preventive-care"],
    spaceLifestyle: ["tip-enrichment", "tip-alone-routine", "tip-neighbor-plan"],
    commitment: ["tip-10-year-view", "tip-boarding-list", "tip-vet-relationship"],
  };

  const tipIds = [
    tipByWeak[weakest.dimension][Math.floor(rand() * 3)]!,
    tipByWeak[strongest.dimension][Math.floor(rand() * 3)]!,
    "tip-track-month",
    setup.grooming === "regular" ? "tip-groom-diy" : "tip-food-quality",
  ].filter((id, i, arr) => arr.indexOf(id) === i);

  return {
    setup,
    costs,
    overall,
    overallBand,
    dimensions,
    profileId,
    insightIds,
    tipIds,
    seed,
  };
}

export function isDogSetupComplete(
  setup: Partial<DogSetup>,
): setup is DogSetup {
  return Boolean(
    setup.size &&
      setup.age &&
      setup.alone &&
      setup.grooming &&
      setup.training,
  );
}

export { calculateDogCosts };
