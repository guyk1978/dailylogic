import { getQuestionsForMode } from "./questions";
import type {
  DimensionScore,
  LikertValue,
  RelationshipAnswers,
  RelationshipDimension,
  RelationshipMode,
  RelationshipProfile,
} from "./types";

const DIMENSIONS: RelationshipDimension[] = [
  "resilience",
  "communication",
  "personalSpace",
  "sharedGrowth",
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

function scoreToBand(score: number): DimensionScore["band"] {
  if (score >= 82) return "strong";
  if (score >= 68) return "steady";
  if (score >= 52) return "developing";
  return "needs-care";
}

/** Likert 1–5 → 0–100 contribution. */
function likertToPercent(value: LikertValue): number {
  return ((value - 1) / 4) * 100;
}

export function analyzeRelationship(
  mode: RelationshipMode,
  answers: RelationshipAnswers,
): RelationshipProfile | null {
  const questions = getQuestionsForMode(mode);
  const answered = questions.filter((q) => answers[q.id] !== undefined);
  if (answered.length < questions.length) return null;

  const totals: Record<RelationshipDimension, { sum: number; weight: number }> =
    {
      resilience: { sum: 0, weight: 0 },
      communication: { sum: 0, weight: 0 },
      personalSpace: { sum: 0, weight: 0 },
      sharedGrowth: { sum: 0, weight: 0 },
    };

  for (const question of answered) {
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

  const dimensions: DimensionScore[] = DIMENSIONS.map((dimension) => {
    const bucket = totals[dimension];
    const raw = bucket.weight > 0 ? bucket.sum / bucket.weight : 50;
    const score = Math.round(clamp(raw, 0, 100) * 10) / 10;
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
    `${mode}|${questions.map((q) => `${q.id}:${answers[q.id]}`).join("|")}`,
  );
  const rand = mulberry32(seed);

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest = sorted[0]!;
  const strongest = sorted[sorted.length - 1]!;

  const profilePool =
    overallBand === "strong"
      ? ["steady-partners", "growing-allies", "quiet-strength"]
      : overallBand === "steady"
        ? ["honest-builders", "work-in-progress-good", "tender-realists"]
        : overallBand === "developing"
          ? ["learning-curve", "fragile-hope", "repair-ready"]
          : ["needs-attention", "honest-wake-up", "care-first"];

  const profileId = profilePool[Math.floor(rand() * profilePool.length)]!;

  const insightCandidates = [
    `dim-${strongest.dimension}-high`,
    `dim-${weakest.dimension}-low`,
    `overall-${overallBand}`,
    "balance-note",
    "humor-note",
  ];
  const insightIds = insightCandidates.slice(0, 3 + Math.floor(rand() * 2));

  const tipByWeak: Record<RelationshipDimension, string[]> = {
    resilience: ["tip-repair-ritual", "tip-stress-plan", "tip-small-reliability"],
    communication: ["tip-weekly-talk", "tip-reflect-before-reply", "tip-soft-start"],
    personalSpace: ["tip-alone-calendar", "tip-friend-night", "tip-no-scorekeeping"],
    sharedGrowth: ["tip-shared-goal", "tip-celebrate-tiny", "tip-fair-chores"],
  };

  const tipIds = [
    tipByWeak[weakest.dimension][Math.floor(rand() * 3)]!,
    tipByWeak[strongest.dimension][Math.floor(rand() * 3)]!,
    "tip-common-sense-pause",
  ];

  return {
    mode,
    overall,
    overallBand,
    dimensions,
    profileId,
    insightIds,
    tipIds,
    seed,
  };
}
