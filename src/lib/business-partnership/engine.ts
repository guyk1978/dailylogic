import { getBusinessQuestionsForMode } from "./questions";
import type {
  BusinessAnswers,
  BusinessDimension,
  BusinessDimensionScore,
  BusinessMode,
  BusinessProfile,
  BusinessSetup,
  LikertValue,
} from "./types";

const DIMENSIONS: BusinessDimension[] = [
  "opsResilience",
  "financialAlignment",
  "conflictGovernance",
  "workloadClarity",
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

function scoreToBand(score: number): BusinessDimensionScore["band"] {
  if (score >= 82) return "strong";
  if (score >= 68) return "steady";
  if (score >= 52) return "developing";
  return "needs-care";
}

function likertToPercent(value: LikertValue): number {
  return ((value - 1) / 4) * 100;
}

/** Soft modifiers from setup — nudge, don't dominate. */
function setupBias(setup: BusinessSetup, dimension: BusinessDimension): number {
  let bias = 0;
  if (setup.status === "considering" && dimension === "opsResilience") bias -= 2;
  if (setup.equity === "complex" && dimension === "financialAlignment") bias -= 3;
  if (setup.equity === "majority" && dimension === "conflictGovernance") bias -= 2;
  if (setup.partners === "4plus" && dimension === "workloadClarity") bias -= 2;
  if (setup.partners === "2" && dimension === "conflictGovernance") bias += 1;
  if (setup.industry === "tech" && dimension === "opsResilience") bias += 0.5;
  return bias;
}

export function analyzeBusinessPartnership(
  mode: BusinessMode,
  setup: BusinessSetup,
  answers: BusinessAnswers,
): BusinessProfile | null {
  const questions = getBusinessQuestionsForMode(mode);
  if (questions.some((q) => answers[q.id] === undefined)) return null;

  const totals: Record<BusinessDimension, { sum: number; weight: number }> = {
    opsResilience: { sum: 0, weight: 0 },
    financialAlignment: { sum: 0, weight: 0 },
    conflictGovernance: { sum: 0, weight: 0 },
    workloadClarity: { sum: 0, weight: 0 },
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

  const dimensions: BusinessDimensionScore[] = DIMENSIONS.map((dimension) => {
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
    `${mode}|${setup.status}|${setup.partners}|${setup.industry}|${setup.equity}|${questions
      .map((q) => `${q.id}:${answers[q.id]}`)
      .join("|")}`,
  );
  const rand = mulberry32(seed);

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest = sorted[0]!;
  const strongest = sorted[sorted.length - 1]!;

  const profilePool =
    overallBand === "strong"
      ? ["aligned-operators", "durable-venture", "clear-bench"]
      : overallBand === "steady"
        ? ["working-partners", "honest-builders-biz", "pragmatic-duo"]
        : overallBand === "developing"
          ? ["alignment-gap", "early-friction", "paperwork-needed"]
          : ["high-risk-signal", "pause-and-write", "founders-talk-now"];

  const profileId = profilePool[Math.floor(rand() * profilePool.length)]!;

  const insightIds = [
    `dim-${strongest.dimension}-high`,
    `dim-${weakest.dimension}-low`,
    `overall-${overallBand}`,
    `industry-${setup.industry}`,
    `equity-${setup.equity}`,
  ].slice(0, 3 + Math.floor(rand() * 2));

  const tipByWeak: Record<BusinessDimension, string[]> = {
    opsResilience: ["tip-decision-rights", "tip-crisis-owner", "tip-exit-clause"],
    financialAlignment: [
      "tip-monthly-money-meeting",
      "tip-expense-thresholds",
      "tip-sweat-vs-cash",
    ],
    conflictGovernance: [
      "tip-deadlock-rule",
      "tip-feedback-ritual",
      "tip-no-side-channels",
    ],
    workloadClarity: [
      "tip-raci-lite",
      "tip-capacity-check",
      "tip-invisible-work-log",
    ],
  };

  const tipIds = [
    tipByWeak[weakest.dimension][Math.floor(rand() * 3)]!,
    tipByWeak[strongest.dimension][Math.floor(rand() * 3)]!,
    "tip-founders-cadence",
  ];

  const agreementPool = [
    "agree-decision-matrix",
    "agree-exit-and-buyout",
    "agree-ip-ownership",
    "agree-compensation-policy",
    "agree-conflict-escalation",
    "agree-time-commitment",
  ];
  const agreementIds = [
    agreementPool[Math.floor(rand() * agreementPool.length)]!,
    agreementPool[Math.floor(rand() * agreementPool.length)]!,
    agreementPool[Math.floor(rand() * agreementPool.length)]!,
  ].filter((id, i, arr) => arr.indexOf(id) === i);

  while (agreementIds.length < 3) {
    const next = agreementPool[Math.floor(rand() * agreementPool.length)]!;
    if (!agreementIds.includes(next)) agreementIds.push(next);
  }

  return {
    mode,
    setup,
    overall,
    overallBand,
    dimensions,
    profileId,
    insightIds,
    tipIds,
    agreementIds,
    seed,
  };
}

export function isSetupComplete(setup: Partial<BusinessSetup>): setup is BusinessSetup {
  return Boolean(
    setup.status && setup.partners && setup.industry && setup.equity,
  );
}
