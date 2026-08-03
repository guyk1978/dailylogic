import { getMentalQuestionsForMode } from "./questions";
import type {
  LikertValue,
  MentalAnswers,
  MentalDimension,
  MentalDimensionScore,
  MentalMode,
  MentalProfile,
  MentalSetup,
} from "./types";

const DIMENSIONS: MentalDimension[] = [
  "stressBalance",
  "restEnergy",
  "personalSpace",
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

function scoreToBand(score: number): MentalDimensionScore["band"] {
  if (score >= 82) return "strong";
  if (score >= 68) return "steady";
  if (score >= 52) return "developing";
  return "needs-care";
}

function likertToPercent(value: LikertValue): number {
  return ((value - 1) / 4) * 100;
}

function setupBias(setup: MentalSetup, dimension: MentalDimension): number {
  let bias = 0;
  if (setup.period === "highPressure" && dimension === "stressBalance")
    bias -= 2;
  if (setup.period === "routine" && dimension === "stressBalance") bias += 0.5;
  if (setup.period === "transition" && dimension === "personalSpace") bias -= 1;
  if (setup.fatigue === "wornDown" && dimension === "restEnergy") bias -= 2.5;
  if (setup.fatigue === "rested" && dimension === "restEnergy") bias += 1;
  if (setup.fatigue === "midweek" && dimension === "restEnergy") bias -= 0.5;
  if (setup.focus === "seekingQuiet" && dimension === "personalSpace")
    bias += 0.5;
  if (setup.focus === "taskPile" && dimension === "stressBalance") bias -= 1;
  if (setup.focus === "futureWorry" && dimension === "stressBalance") bias -= 1;
  if (setup.focus === "timePressure" && dimension === "stressBalance")
    bias -= 0.5;
  return bias;
}

export function analyzeMentalHealth(
  mode: MentalMode,
  setup: MentalSetup,
  answers: MentalAnswers,
): MentalProfile | null {
  const questions = getMentalQuestionsForMode(mode);
  if (questions.some((q) => answers[q.id] === undefined)) return null;

  const totals: Record<MentalDimension, { sum: number; weight: number }> = {
    stressBalance: { sum: 0, weight: 0 },
    restEnergy: { sum: 0, weight: 0 },
    personalSpace: { sum: 0, weight: 0 },
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

  const dimensions: MentalDimensionScore[] = DIMENSIONS.map((dimension) => {
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
    `${mode}|${setup.period}|${setup.fatigue}|${setup.focus}|${questions
      .map((q) => `${q.id}:${answers[q.id]}`)
      .join("|")}`,
  );
  const rand = mulberry32(seed);

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest = sorted[0]!;
  const strongest = sorted[sorted.length - 1]!;

  const profilePool =
    overallBand === "strong"
      ? ["steady-harbor", "gentle-strength", "balanced-pace"]
      : overallBand === "steady"
        ? ["mostly-steady", "learning-rest", "holding-on-well"]
        : overallBand === "developing"
          ? ["thin-reserves", "too-many-plates", "quiet-needed"]
          : ["ask-for-space", "rebuild-gently", "one-step-today"];

  const profileId = profilePool[Math.floor(rand() * profilePool.length)]!;

  const insightIds = [
    `dim-${strongest.dimension}-high`,
    `dim-${weakest.dimension}-low`,
    `overall-${overallBand}`,
    `period-${setup.period}`,
    `fatigue-${setup.fatigue}`,
    `focus-${setup.focus}`,
  ].slice(0, 3 + Math.floor(rand() * 2));

  const tipByWeak: Record<MentalDimension, string[]> = {
    stressBalance: [
      "tip-ten-minute-box",
      "tip-write-three-worries",
      "tip-one-task-rule",
    ],
    restEnergy: [
      "tip-earlier-lights-out",
      "tip-short-walk",
      "tip-water-and-sit",
    ],
    personalSpace: [
      "tip-protect-half-hour",
      "tip-soft-no-script",
      "tip-phone-away-meal",
    ],
  };

  const tipIds = [
    tipByWeak[weakest.dimension][Math.floor(rand() * 3)]!,
    tipByWeak[strongest.dimension][Math.floor(rand() * 3)]!,
    "tip-evening-close",
    setup.fatigue === "wornDown" ? "tip-ask-one-favor" : "tip-tiny-joy-today",
  ].filter((id, i, arr) => arr.indexOf(id) === i);

  return {
    mode,
    setup,
    overall,
    overallBand,
    dimensions,
    profileId,
    insightIds,
    tipIds,
    seed,
  };
}

export function isMentalSetupComplete(
  setup: Partial<MentalSetup>,
): setup is MentalSetup {
  return Boolean(setup.period && setup.fatigue && setup.focus);
}
