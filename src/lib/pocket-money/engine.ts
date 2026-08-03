import { getPocketQuestionsForMode } from "./questions";
import type {
  AgeGroup,
  LikertValue,
  PocketAnswers,
  PocketDimension,
  PocketDimensionScore,
  PocketMode,
  PocketProfile,
  PocketSetup,
  PocketSplit,
  PrimaryGoal,
  RecommendedAmount,
} from "./types";

const DIMENSIONS: PocketDimension[] = [
  "moneyResponsibility",
  "savingDiscipline",
  "familyPartnership",
  "spendingWisdom",
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

function scoreToBand(score: number): PocketDimensionScore["band"] {
  if (score >= 82) return "strong";
  if (score >= 68) return "steady";
  if (score >= 52) return "developing";
  return "needs-care";
}

function likertToPercent(value: LikertValue): number {
  return ((value - 1) / 4) * 100;
}

function setupBias(setup: PocketSetup, dimension: PocketDimension): number {
  let bias = 0;
  if (setup.age === "young" && dimension === "moneyResponsibility") bias -= 1;
  if (setup.age === "teen" && dimension === "spendingWisdom") bias += 0.5;
  if (setup.model === "chores" && dimension === "familyPartnership") bias += 1;
  if (setup.model === "fixed" && dimension === "savingDiscipline") bias -= 1;
  if (setup.goal === "save-goal" && dimension === "savingDiscipline") bias += 1.5;
  if (setup.goal === "delay" && dimension === "spendingWisdom") bias += 1;
  return bias;
}

const BASE_AMOUNT: Record<AgeGroup, RecommendedAmount> = {
  young: { min: 40, mid: 70, max: 110 },
  tween: { min: 80, mid: 140, max: 220 },
  teen: { min: 150, mid: 260, max: 420 },
};

function baseSplit(goal: PrimaryGoal): PocketSplit {
  switch (goal) {
    case "delay":
      return { spend: 50, save: 40, give: 10 };
    case "save-goal":
      return { spend: 40, save: 50, give: 10 };
    case "independence":
      return { spend: 55, save: 30, give: 15 };
    case "value":
      return { spend: 45, save: 35, give: 20 };
  }
}

function normalizeSplit(split: PocketSplit): PocketSplit {
  const spend = Math.round(clamp(split.spend, 20, 70));
  const give = Math.round(clamp(split.give, 5, 25));
  let save = 100 - spend - give;
  if (save < 15) {
    const deficit = 15 - save;
    const fromSpend = Math.min(deficit, spend - 20);
    return {
      spend: spend - fromSpend,
      save: 15,
      give: 100 - (spend - fromSpend) - 15,
    };
  }
  return { spend, save, give };
}

function recommendAmount(
  setup: PocketSetup,
  overall: number,
  responsibility: number,
  saving: number,
): RecommendedAmount {
  const base = BASE_AMOUNT[setup.age];
  let factor = 1;
  if (overall >= 78 && responsibility >= 70) factor += 0.12;
  else if (overall < 55 || responsibility < 50) factor -= 0.1;
  if (setup.model === "hybrid") factor += 0.05;
  if (setup.model === "chores" && responsibility >= 65) factor += 0.08;
  if (saving >= 75 && setup.goal === "save-goal") factor += 0.04;

  const mid = Math.round(base.mid * factor / 5) * 5;
  const min = Math.round(clamp(mid * 0.65, base.min * 0.8, mid - 10) / 5) * 5;
  const max = Math.round(clamp(mid * 1.35, mid + 15, base.max * 1.15) / 5) * 5;
  return { min, mid, max };
}

function computeSplit(
  setup: PocketSetup,
  saving: number,
  wisdom: number,
  partnership: number,
): PocketSplit {
  const split = { ...baseSplit(setup.goal) };
  if (saving >= 75) {
    split.save += 5;
    split.spend -= 5;
  } else if (saving < 55) {
    split.save -= 5;
    split.spend += 5;
  }
  if (wisdom < 55) {
    split.spend -= 5;
    split.save += 5;
  }
  if (partnership >= 75 && setup.goal === "value") {
    split.give += 5;
    split.spend -= 5;
  }
  if (setup.model === "hybrid") {
    split.save += 3;
    split.spend -= 3;
  }
  return normalizeSplit(split);
}

export function analyzePocketMoney(
  mode: PocketMode,
  setup: PocketSetup,
  answers: PocketAnswers,
): PocketProfile | null {
  const questions = getPocketQuestionsForMode(mode);
  if (questions.some((q) => answers[q.id] === undefined)) return null;

  const totals: Record<PocketDimension, { sum: number; weight: number }> = {
    moneyResponsibility: { sum: 0, weight: 0 },
    savingDiscipline: { sum: 0, weight: 0 },
    familyPartnership: { sum: 0, weight: 0 },
    spendingWisdom: { sum: 0, weight: 0 },
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

  const dimensions: PocketDimensionScore[] = DIMENSIONS.map((dimension) => {
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

  const byDim = Object.fromEntries(
    dimensions.map((d) => [d.dimension, d.score]),
  ) as Record<PocketDimension, number>;

  const recommendedAmount = recommendAmount(
    setup,
    overall,
    byDim.moneyResponsibility,
    byDim.savingDiscipline,
  );
  const split = computeSplit(
    setup,
    byDim.savingDiscipline,
    byDim.spendingWisdom,
    byDim.familyPartnership,
  );

  const seed = hashString(
    `${mode}|${setup.age}|${setup.model}|${setup.goal}|${questions
      .map((q) => `${q.id}:${answers[q.id]}`)
      .join("|")}`,
  );
  const rand = mulberry32(seed);

  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest = sorted[0]!;
  const strongest = sorted[sorted.length - 1]!;

  const profilePool =
    overallBand === "strong"
      ? ["steady-partners", "savvy-team", "trust-builders"]
      : overallBand === "steady"
        ? ["learning-crew", "fair-starters", "growing-together"]
        : overallBand === "developing"
          ? ["needs-structure", "practice-week", "clarify-rules"]
          : ["reset-gently", "start-smaller", "talk-first"];

  const profileId = profilePool[Math.floor(rand() * profilePool.length)]!;

  const insightIds = [
    `dim-${strongest.dimension}-high`,
    `dim-${weakest.dimension}-low`,
    `overall-${overallBand}`,
    `age-${setup.age}`,
    `model-${setup.model}`,
    `goal-${setup.goal}`,
  ].slice(0, 3 + Math.floor(rand() * 2));

  const tipByWeak: Record<PocketDimension, string[]> = {
    moneyResponsibility: [
      "tip-sunday-reset",
      "tip-empty-wallet-plan",
      "tip-visible-tracker",
    ],
    savingDiscipline: [
      "tip-pay-yourself-first",
      "tip-photo-goal",
      "tip-match-small",
    ],
    familyPartnership: [
      "tip-family-meeting",
      "tip-chore-menu",
      "tip-two-voices",
    ],
    spendingWisdom: [
      "tip-24h-pause",
      "tip-needs-wants-list",
      "tip-give-jar",
    ],
  };

  const tipIds = [
    tipByWeak[weakest.dimension][Math.floor(rand() * 3)]!,
    tipByWeak[strongest.dimension][Math.floor(rand() * 3)]!,
    "tip-monthly-review",
  ];

  const habitPool = [
    "habit-jar-split",
    "habit-receipt-photo",
    "habit-goal-countdown",
    "habit-praise-ritual",
    "habit-no-bailout-default",
    "habit-earn-bonus-lane",
  ];
  const habitIds = [
    habitPool[Math.floor(rand() * habitPool.length)]!,
    habitPool[Math.floor(rand() * habitPool.length)]!,
    habitPool[Math.floor(rand() * habitPool.length)]!,
  ].filter((id, i, arr) => arr.indexOf(id) === i);

  while (habitIds.length < 3) {
    const next = habitPool[Math.floor(rand() * habitPool.length)]!;
    if (!habitIds.includes(next)) habitIds.push(next);
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
    habitIds,
    recommendedAmount,
    split,
    seed,
  };
}

export function isPocketSetupComplete(
  setup: Partial<PocketSetup>,
): setup is PocketSetup {
  return Boolean(setup.age && setup.model && setup.goal);
}
