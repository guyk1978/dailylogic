import { getStrangerQuestionsForMode } from "./questions";
import type {
  LikertValue,
  StrangerAnswers,
  StrangerDimension,
  StrangerDimensionScore,
  StrangerMode,
  StrangerProfile,
  StrangerSetup,
} from "./types";

const DIMENSIONS: StrangerDimension[] = [
  "privacyGuard",
  "socialGrace",
  "gutInstinct",
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

function scoreToBand(score: number): StrangerDimensionScore["band"] {
  if (score >= 82) return "strong";
  if (score >= 68) return "steady";
  if (score >= 52) return "developing";
  return "needs-care";
}

function likertToPercent(value: LikertValue): number {
  return ((value - 1) / 4) * 100;
}

function setupBias(setup: StrangerSetup, dimension: StrangerDimension): number {
  let bias = 0;
  if (setup.counterpart === "prying" && dimension === "privacyGuard") bias -= 1.5;
  if (setup.counterpart === "pleasant" && dimension === "socialGrace") bias += 0.5;
  if (setup.counterpart === "professional" && dimension === "privacyGuard")
    bias += 0.5;
  if (setup.place === "socialOnline" && dimension === "gutInstinct") bias -= 1;
  if (setup.place === "networking" && dimension === "socialGrace") bias += 0.5;
  if (setup.goal === "survivePolitely" && dimension === "privacyGuard") bias += 1;
  if (setup.goal === "checkBoundaries" && dimension === "gutInstinct") bias += 0.5;
  return bias;
}

export function analyzeStrangerSharing(
  mode: StrangerMode,
  setup: StrangerSetup,
  answers: StrangerAnswers,
): StrangerProfile | null {
  const questions = getStrangerQuestionsForMode(mode);
  if (questions.some((q) => answers[q.id] === undefined)) return null;

  const totals: Record<StrangerDimension, { sum: number; weight: number }> = {
    privacyGuard: { sum: 0, weight: 0 },
    socialGrace: { sum: 0, weight: 0 },
    gutInstinct: { sum: 0, weight: 0 },
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

  const dimensions: StrangerDimensionScore[] = DIMENSIONS.map((dimension) => {
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
    `${mode}|${setup.place}|${setup.counterpart}|${setup.goal}|${questions
      .map((q) => `${q.id}:${answers[q.id]}`)
      .join("|")}`,
  );
  const rand = mulberry32(seed);

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest = sorted[0]!;
  const strongest = sorted[sorted.length - 1]!;

  const profilePool =
    overallBand === "strong"
      ? ["graceful-guard", "warm-fence", "street-smart-kind"]
      : overallBand === "steady"
        ? ["mostly-steady", "learning-filters", "polite-and-aware"]
        : overallBand === "developing"
          ? ["leaky-edges", "people-pleaser-risk", "silence-filler"]
          : ["overshare-alert", "rebuild-filters", "pause-before-speak"];

  const profileId = profilePool[Math.floor(rand() * profilePool.length)]!;

  const insightIds = [
    `dim-${strongest.dimension}-high`,
    `dim-${weakest.dimension}-low`,
    `overall-${overallBand}`,
    `place-${setup.place}`,
    `counterpart-${setup.counterpart}`,
    `goal-${setup.goal}`,
  ].slice(0, 3 + Math.floor(rand() * 2));

  const tipByWeak: Record<StrangerDimension, string[]> = {
    privacyGuard: [
      "tip-three-layer-rule",
      "tip-swap-detail-for-theme",
      "tip-no-names-numbers",
    ],
    socialGrace: [
      "tip-bridge-question",
      "tip-bathroom-exit",
      "tip-agree-and-steer",
    ],
    gutInstinct: [
      "tip-body-check",
      "tip-delay-answer",
      "tip-curiosity-tax",
    ],
  };

  const tipIds = [
    tipByWeak[weakest.dimension][Math.floor(rand() * 3)]!,
    tipByWeak[strongest.dimension][Math.floor(rand() * 3)]!,
    "tip-post-chat-debrief",
    setup.place === "socialOnline" ? "tip-online-slow" : "tip-public-volume",
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

export function isStrangerSetupComplete(
  setup: Partial<StrangerSetup>,
): setup is StrangerSetup {
  return Boolean(setup.place && setup.counterpart && setup.goal);
}
