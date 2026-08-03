import { getLoveInput, getLoveMood } from "./inputs-data";
import {
  INSIGHT_TEMPLATES,
  MATCHUP_INSIGHT_IDS,
  WEEKLY_SUMMARY_IDS,
  WEEKLY_TITLE_IDS,
} from "./insights-data";
import type {
  InsightBand,
  InsightTemplate,
  LoveInputCategoryId,
  LoveSelection,
  LoveTraits,
  MatchupRelation,
  MatchupResult,
  SynergyResult,
  TimeOfDay,
  WeeklyReportResult,
} from "./types";

const TRAIT_KEYS: (keyof LoveTraits)[] = [
  "energy",
  "chaos",
  "comfort",
  "social",
  "indulgence",
];

/** Deterministic 32-bit hash for reproducible “randomness”. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
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

function avgTraits(a: LoveTraits, b: LoveTraits): LoveTraits {
  const out = {} as LoveTraits;
  for (const key of TRAIT_KEYS) {
    out[key] = (a[key] + b[key]) / 2;
  }
  return out;
}

function avgTraitsMany(items: LoveTraits[]): LoveTraits {
  const out = {} as LoveTraits;
  for (const key of TRAIT_KEYS) {
    out[key] = items.reduce((sum, item) => sum + item[key], 0) / items.length;
  }
  return out;
}

function traitDistance(a: LoveTraits, b: LoveTraits): number {
  let sum = 0;
  for (const key of TRAIT_KEYS) {
    const d = a[key] - b[key];
    sum += d * d;
  }
  return Math.sqrt(sum / TRAIT_KEYS.length);
}

function complementBonus(a: LoveTraits, b: LoveTraits): number {
  const cozyChaos =
    (a.comfort + b.comfort) / 2 >= 70 && (a.chaos + b.chaos) / 2 >= 45
      ? 8
      : 0;
  const calmFocus =
    Math.abs(a.energy - b.energy) <= 20 && (a.chaos + b.chaos) / 2 <= 30
      ? 6
      : 0;
  const socialBridge =
    Math.abs(a.social - b.social) >= 40 && (a.social + b.social) / 2 >= 40
      ? 5
      : 0;
  const indulgenceAlign =
    Math.abs(a.indulgence - b.indulgence) <= 18 ? 4 : 0;
  return cozyChaos + calmFocus + socialBridge + indulgenceAlign;
}

export function scoreToBand(score: number): InsightBand {
  if (score >= 94) return "legendary";
  if (score >= 82) return "high";
  if (score >= 70) return "mid";
  return "low";
}

export function getTimeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

export function computeSynergy(selection: LoveSelection): SynergyResult | null {
  const joy = getLoveInput(selection.joyId);
  const vice = getLoveInput(selection.viceId);
  const mood = getLoveMood(selection.moodId);
  if (!joy || !vice || !mood) return null;

  const seed = hashString(
    `${selection.joyId}|${selection.viceId}|${selection.moodId}`,
  );
  const rand = mulberry32(seed);

  const blend = avgTraits(joy.traits, vice.traits);
  const distance = traitDistance(joy.traits, vice.traits);
  const similarityScore = clamp(100 - distance * 0.85, 55, 96);
  const complements = complementBonus(joy.traits, vice.traits);

  const sharedTags = joy.tags.filter((tag) => vice.tags.includes(tag));
  const tagBoost = Math.min(sharedTags.length * 2.4, 8);

  const sameCategory = joy.category === vice.category ? -3 : 2;
  const moodBias = mood.scoreBias;

  let moodPull = 0;
  for (const key of TRAIT_KEYS) {
    const m = mood.traits[key];
    if (m === undefined) continue;
    moodPull += 4 - Math.min(Math.abs(blend[key] - m) / 25, 4);
  }

  const jitter = (rand() - 0.5) * 4.2;
  const raw =
    similarityScore * 0.62 +
    complements +
    tagBoost +
    sameCategory +
    moodBias +
    moodPull * 0.35 +
    jitter;

  const score = Math.round(clamp(raw, 62, 99.7) * 10) / 10;
  const band = scoreToBand(score);

  return {
    score,
    band,
    seed,
    synergyLabel: band,
    traitBlend: blend,
  };
}

export function computeMatchup(
  leftId: string,
  rightId: string,
): MatchupResult | null {
  if (leftId === rightId) return null;
  const left = getLoveInput(leftId);
  const right = getLoveInput(rightId);
  if (!left || !right) return null;

  const seed = hashString(`matchup|${leftId}|${rightId}`);
  const rand = mulberry32(seed);
  const blend = avgTraits(left.traits, right.traits);
  const distance = traitDistance(left.traits, right.traits);
  const complements = complementBonus(left.traits, right.traits);
  const sharedTags = left.tags.filter((tag) => right.tags.includes(tag));

  const harmony = clamp(100 - distance * 0.9 + complements * 0.7, 20, 98);
  const frictionRaw = clamp(distance * 1.05 - complements * 0.4, 8, 92);
  const jitter = (rand() - 0.5) * 3.5;

  const score = Math.round(clamp(harmony + jitter, 28, 99.4) * 10) / 10;
  const friction = Math.round(clamp(frictionRaw - jitter * 0.5, 5, 95) * 10) / 10;

  let relation: MatchupRelation = "synergy";
  if (friction >= 58 && complements >= 8) relation = "productive-friction";
  else if (friction >= 55 || score < 55) relation = "friction";

  return {
    score,
    friction,
    band: scoreToBand(score),
    relation,
    seed,
    traitBlend: blend,
    sharedTags,
  };
}

export function computeWeeklyReport(
  itemIds: [string, string, string],
  salt = 0,
): WeeklyReportResult | null {
  const unique = new Set(itemIds);
  if (unique.size !== 3) return null;

  const items = itemIds.map((id) => getLoveInput(id));
  if (items.some((item) => !item)) return null;
  const defined = items as NonNullable<(typeof items)[number]>[];

  const seed = hashString(`weekly|${[...itemIds].sort().join("|")}|${salt}`);
  const rand = mulberry32(seed);
  const blend = avgTraitsMany(defined.map((item) => item.traits));

  const tagCounts = new Map<string, number>();
  for (const item of defined) {
    for (const tag of item.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const dominantTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([tag]) => tag);

  const chaos = blend.chaos;
  const comfort = blend.comfort;
  const energy = blend.energy;
  const base =
    comfort * 0.28 +
    energy * 0.22 +
    (100 - Math.abs(chaos - 45)) * 0.18 +
    blend.indulgence * 0.12 +
    blend.social * 0.1 +
    Math.min(dominantTags.length * 3, 12);

  const score = Math.round(clamp(base + (rand() - 0.5) * 5, 58, 98.8) * 10) / 10;
  const band = scoreToBand(score);

  const titlePool = WEEKLY_TITLE_IDS.filter((id) => {
    if (id.includes("caffeine") && dominantTags.includes("caffeine")) return true;
    if (id.includes("chaos") && chaos >= 55) return true;
    if (id.includes("cozy") && comfort >= 75) return true;
    if (id.includes("social") && blend.social >= 60) return true;
    if (id.includes("quiet") && blend.social <= 25) return true;
    if (id.includes("luck") && dominantTags.includes("luck")) return true;
    if (id.includes("survivor")) return true;
    if (id.includes("balanced")) return true;
    if (id.includes("soft")) return true;
    if (id.includes("engineer")) return true;
    return id.startsWith("weekly-generic");
  });
  const titles = titlePool.length > 0 ? titlePool : WEEKLY_TITLE_IDS;
  const titleId = titles[Math.floor(rand() * titles.length)]!;

  const summaries = WEEKLY_SUMMARY_IDS;
  const summaryId = summaries[Math.floor(rand() * summaries.length)]!;

  return {
    score,
    band,
    seed,
    titleId,
    summaryId,
    dominantTags,
    traitBlend: blend,
  };
}

function categoryPairKey(
  a: LoveInputCategoryId,
  b: LoveInputCategoryId,
): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function scoreInsightMatch(
  template: InsightTemplate,
  selection: LoveSelection,
  band: InsightBand,
  timeOfDay?: TimeOfDay,
): number {
  const joy = getLoveInput(selection.joyId);
  const vice = getLoveInput(selection.viceId);
  const mood = getLoveMood(selection.moodId);
  if (!joy || !vice || !mood) return -Infinity;

  let score = 0;

  if (template.bands.length === 0 || template.bands.includes(band)) {
    score += template.bands.length === 0 ? 1 : 6;
  } else {
    score -= 8;
  }

  const tags = new Set([...joy.tags, ...vice.tags]);
  for (const tag of template.preferTags) {
    if (tags.has(tag)) score += 3;
  }

  const pair = categoryPairKey(joy.category, vice.category);
  for (const [c1, c2] of template.preferCategoryPairs) {
    if (categoryPairKey(c1, c2) === pair) score += 5;
  }

  for (const tag of template.preferMoodTags) {
    if (mood.tags.includes(tag)) score += 3;
  }

  if (timeOfDay && template.preferTimes?.length) {
    score += template.preferTimes.includes(timeOfDay) ? 5 : -2;
  }

  if (!template.id.startsWith("generic")) score += 0.5;
  if (template.id.startsWith("deep-dive")) score += 0.25;
  if (template.id.startsWith("time-")) score += timeOfDay ? 1.5 : 0;

  return score;
}

export function rankInsights(
  selection: LoveSelection,
  band: InsightBand,
  timeOfDay?: TimeOfDay,
): InsightTemplate[] {
  return [...INSIGHT_TEMPLATES]
    .map((template) => ({
      template,
      match: scoreInsightMatch(template, selection, band, timeOfDay),
    }))
    .filter((row) => row.match > -4)
    .sort((a, b) => b.match - a.match)
    .map((row) => row.template);
}

export function pickInsightId(
  selection: LoveSelection,
  band: InsightBand,
  excludeIds: string[] = [],
  salt = 0,
  timeOfDay?: TimeOfDay,
): string {
  const ranked = rankInsights(selection, band, timeOfDay).filter(
    (t) => !excludeIds.includes(t.id),
  );
  const pool = ranked.length > 0 ? ranked : INSIGHT_TEMPLATES;
  const seed = hashString(
    `${selection.joyId}|${selection.viceId}|${selection.moodId}|${band}|${timeOfDay ?? ""}|${salt}`,
  );
  const rand = mulberry32(seed);
  const topN = Math.min(8, pool.length);
  const index = Math.floor(rand() * topN);
  return pool[index]?.id ?? pool[0]!.id;
}

export function pickMatchupInsightId(
  leftId: string,
  rightId: string,
  relation: MatchupRelation,
  excludeIds: string[] = [],
  salt = 0,
): string {
  const preferred = MATCHUP_INSIGHT_IDS.filter((id) => {
    if (excludeIds.includes(id)) return false;
    if (relation === "synergy") return id.includes("synergy") || id.includes("harmony") || id.includes("duo");
    if (relation === "productive-friction")
      return id.includes("productive") || id.includes("tension") || id.includes("sparks");
    return id.includes("friction") || id.includes("clash") || id.includes("versus");
  });
  const pool =
    preferred.length > 0
      ? preferred
      : MATCHUP_INSIGHT_IDS.filter((id) => !excludeIds.includes(id));
  const fallback = pool.length > 0 ? pool : MATCHUP_INSIGHT_IDS;
  const seed = hashString(`mi|${leftId}|${rightId}|${relation}|${salt}`);
  const rand = mulberry32(seed);
  return fallback[Math.floor(rand() * fallback.length)]!;
}

export function pickTimeNoteId(
  timeOfDay: TimeOfDay,
  salt = 0,
): string {
  const seed = hashString(`time-note|${timeOfDay}|${salt}`);
  const rand = mulberry32(seed);
  const index = Math.floor(rand() * 4);
  return `${timeOfDay}-${index + 1}`;
}
