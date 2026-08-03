import { getParentQuestionsForMode } from "./questions";
import type {
  LikertValue,
  ParentAnswers,
  ParentDimension,
  ParentDimensionScore,
  ParentMode,
  ParentProfile,
  ParentSetup,
} from "./types";

const DIMENSIONS: ParentDimension[] = [
  "presence",
  "listening",
  "emotionalBalance",
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

function scoreToBand(score: number): ParentDimensionScore["band"] {
  if (score >= 82) return "strong";
  if (score >= 68) return "steady";
  if (score >= 52) return "developing";
  return "needs-care";
}

function likertToPercent(value: LikertValue): number {
  return ((value - 1) / 4) * 100;
}

function setupBias(setup: ParentSetup, dimension: ParentDimension): number {
  let bias = 0;
  if (setup.distance === "farAway" && dimension === "presence") bias -= 2;
  if (setup.distance === "sameArea" && dimension === "presence") bias += 1;
  if (setup.contact === "mostlyPhone" && dimension === "listening") bias += 0.5;
  if (setup.contact === "daily" && dimension === "emotionalBalance") bias -= 0.5;
  if (setup.stage === "caregiving" && dimension === "emotionalBalance") bias -= 2;
  if (setup.stage === "independent" && dimension === "listening") bias += 0.5;
  return bias;
}

export function analyzeParentRespect(
  mode: ParentMode,
  setup: ParentSetup,
  answers: ParentAnswers,
): ParentProfile | null {
  const questions = getParentQuestionsForMode(mode);
  if (questions.some((q) => answers[q.id] === undefined)) return null;

  const totals: Record<ParentDimension, { sum: number; weight: number }> = {
    presence: { sum: 0, weight: 0 },
    listening: { sum: 0, weight: 0 },
    emotionalBalance: { sum: 0, weight: 0 },
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

  const dimensions: ParentDimensionScore[] = DIMENSIONS.map((dimension) => {
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
    `${mode}|${setup.distance}|${setup.contact}|${setup.stage}|${questions
      .map((q) => `${q.id}:${answers[q.id]}`)
      .join("|")}`,
  );
  const rand = mulberry32(seed);

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest = sorted[0]!;
  const strongest = sorted[sorted.length - 1]!;

  const profilePool =
    overallBand === "strong"
      ? ["steady-honor", "warm-bridge", "rooted-respect"]
      : overallBand === "steady"
        ? ["present-enough", "learning-balance", "good-intent"]
        : overallBand === "developing"
          ? ["gap-to-close", "guilt-heavy", "thin-contact"]
          : ["rebuild-gently", "pause-and-plan", "start-small"];

  const profileId = profilePool[Math.floor(rand() * profilePool.length)]!;

  const insightIds = [
    `dim-${strongest.dimension}-high`,
    `dim-${weakest.dimension}-low`,
    `overall-${overallBand}`,
    `distance-${setup.distance}`,
    `stage-${setup.stage}`,
    `contact-${setup.contact}`,
  ].slice(0, 3 + Math.floor(rand() * 2));

  const tipByWeak: Record<ParentDimension, string[]> = {
    presence: ["tip-fixed-slot", "tip-voice-note", "tip-shared-errand"],
    listening: ["tip-two-questions", "tip-phone-walk", "tip-no-advice-first"],
    emotionalBalance: [
      "tip-guilt-budget",
      "tip-boundary-script",
      "tip-sibling-huddle",
    ],
  };

  const tipIds = [
    tipByWeak[weakest.dimension][Math.floor(rand() * 3)]!,
    tipByWeak[strongest.dimension][Math.floor(rand() * 3)]!,
    "tip-sunday-check",
    setup.distance === "farAway" ? "tip-visit-ritual" : "tip-doorstep-coffee",
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

export function isParentSetupComplete(
  setup: Partial<ParentSetup>,
): setup is ParentSetup {
  return Boolean(setup.distance && setup.contact && setup.stage);
}
