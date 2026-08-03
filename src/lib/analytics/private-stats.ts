/**
 * Private, anonymous first-party usage stats for calculators & quizzes.
 *
 * - Stored only in this browser under a dedicated localStorage key
 * - Never sends data to a server
 * - Never stores names, free text, emails, or other identifiers
 * - Only aggregate counters: starts, completions, question/option tallies
 */

import type { ToolSlug } from "@/lib/tools-registry";

export const PRIVATE_STATS_STORAGE_KEY = "dailylogic:private-stats";
export const PRIVATE_STATS_VERSION = 1 as const;

export type AnswerKey = string;

export interface QuestionStats {
  /** Times a committed answer was recorded for this question */
  answered: number;
  /** Counts per option / Likert value (stringified) */
  options: Record<AnswerKey, number>;
}

export interface ModeStats {
  started: number;
  completed: number;
}

export interface ToolPrivateStats {
  started: number;
  completed: number;
  /** Optional mode breakdown (quick / full / …) */
  modes: Record<string, ModeStats>;
  questions: Record<string, QuestionStats>;
  /** Anonymous categorical choices (setup chips, etc.) — never free text */
  choices: Record<string, Record<AnswerKey, number>>;
  /** Anonymous outcome bands / profile ids */
  outcomes: Record<string, number>;
}

export interface PrivateStatsStore {
  version: typeof PRIVATE_STATS_VERSION;
  updatedAt: number;
  tools: Partial<Record<ToolSlug, ToolPrivateStats>>;
}

export interface ToolStatsSummary {
  toolSlug: ToolSlug;
  /** Anonymous page opens (tool page views) */
  opens: number;
  started: number;
  completed: number;
  /** 0–1; null when nothing started */
  completionRate: number | null;
  popularQuestions: Array<{
    questionId: string;
    answered: number;
    topOption: AnswerKey | null;
    topOptionCount: number;
  }>;
  modes: Array<{
    mode: string;
    started: number;
    completed: number;
    completionRate: number | null;
  }>;
  topOutcomes: Array<{ outcome: string; count: number }>;
}

export interface PrivateStatsOverview {
  opens: number;
  started: number;
  completed: number;
  completionRate: number | null;
  toolsWithActivity: number;
  updatedAt: number | null;
}

function emptyToolStats(): ToolPrivateStats {
  return {
    started: 0,
    completed: 0,
    modes: {},
    questions: {},
    choices: {},
    outcomes: {},
  };
}

function emptyStore(): PrivateStatsStore {
  return {
    version: PRIVATE_STATS_VERSION,
    updatedAt: Date.now(),
    tools: {},
  };
}

function sanitizeKey(raw: string): string {
  return raw.trim().slice(0, 80);
}

function toAnswerKey(value: string | number | boolean): AnswerKey {
  return String(value).slice(0, 64);
}

function rate(completed: number, started: number): number | null {
  if (started <= 0) return null;
  return completed / started;
}

export function getToolOpenCount(bucket: ToolPrivateStats): number {
  const opens = bucket.choices.__opens;
  if (!opens) return 0;
  return Object.values(opens).reduce((sum, n) => sum + n, 0);
}

export function readPrivateStatsStore(): PrivateStatsStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(PRIVATE_STATS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PrivateStatsStore;
    if (!parsed || parsed.version !== PRIVATE_STATS_VERSION || !parsed.tools) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

function writePrivateStatsStore(store: PrivateStatsStore): void {
  if (typeof window === "undefined") return;
  try {
    const next: PrivateStatsStore = {
      ...store,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(PRIVATE_STATS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota / private mode — fail silently to keep tools usable
  }
}

function mutateTool(
  toolSlug: ToolSlug,
  mutator: (bucket: ToolPrivateStats) => void,
): void {
  const store = readPrivateStatsStore();
  const bucket = store.tools[toolSlug]
    ? { ...emptyToolStats(), ...store.tools[toolSlug] }
    : emptyToolStats();
  // Deep-clone nested maps so we don't mutate frozen/parsed refs oddly
  bucket.modes = { ...bucket.modes };
  bucket.questions = { ...bucket.questions };
  bucket.choices = { ...bucket.choices };
  bucket.outcomes = { ...bucket.outcomes };
  mutator(bucket);
  store.tools[toolSlug] = bucket;
  writePrivateStatsStore(store);
}

/** Tool page opened / calculator visited (anonymous view). */
export function trackToolOpen(toolSlug: ToolSlug): void {
  // Opens are separate from quiz "started" — counted as soft interest only
  // via a reserved choice bucket so completion rates stay quiz-accurate.
  mutateTool(toolSlug, (bucket) => {
    const opens = bucket.choices.__opens ?? {};
    const next = { ...opens, view: (opens.view ?? 0) + 1 };
    bucket.choices.__opens = next;
  });
}

/** Quiz / flow started (mode optional). */
export function trackToolStart(
  toolSlug: ToolSlug,
  options?: { mode?: string },
): void {
  mutateTool(toolSlug, (bucket) => {
    bucket.started += 1;
    const mode = options?.mode ? sanitizeKey(options.mode) : "";
    if (mode) {
      const prev = bucket.modes[mode] ?? { started: 0, completed: 0 };
      bucket.modes[mode] = {
        started: prev.started + 1,
        completed: prev.completed,
      };
    }
  });
}

/**
 * Record a committed answer (call when the user advances, not on every tap).
 * Values must be categorical (Likert, option id) — never free text.
 */
export function trackQuestionAnswer(
  toolSlug: ToolSlug,
  questionId: string,
  value: string | number | boolean,
): void {
  const qid = sanitizeKey(questionId);
  if (!qid) return;
  const key = toAnswerKey(value);

  mutateTool(toolSlug, (bucket) => {
    const prev = bucket.questions[qid] ?? { answered: 0, options: {} };
    const options = { ...prev.options, [key]: (prev.options[key] ?? 0) + 1 };
    bucket.questions[qid] = {
      answered: prev.answered + 1,
      options,
    };
  });
}

/** Anonymous categorical choice (setup chips, etc.). */
export function trackChoice(
  toolSlug: ToolSlug,
  choiceId: string,
  value: string | number | boolean,
): void {
  const cid = sanitizeKey(choiceId);
  if (!cid || cid.startsWith("__")) return;
  const key = toAnswerKey(value);

  mutateTool(toolSlug, (bucket) => {
    const prev = bucket.choices[cid] ?? {};
    bucket.choices[cid] = { ...prev, [key]: (prev[key] ?? 0) + 1 };
  });
}

/** Flow reached a result screen. */
export function trackToolComplete(
  toolSlug: ToolSlug,
  options?: { mode?: string; outcome?: string },
): void {
  mutateTool(toolSlug, (bucket) => {
    bucket.completed += 1;
    const mode = options?.mode ? sanitizeKey(options.mode) : "";
    if (mode) {
      const prev = bucket.modes[mode] ?? { started: 0, completed: 0 };
      bucket.modes[mode] = {
        started: prev.started,
        completed: prev.completed + 1,
      };
    }
    const outcome = options?.outcome ? sanitizeKey(options.outcome) : "";
    if (outcome) {
      bucket.outcomes[outcome] = (bucket.outcomes[outcome] ?? 0) + 1;
    }
  });
}

export function clearPrivateStats(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PRIVATE_STATS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function summarizeToolStats(
  toolSlug: ToolSlug,
  store: PrivateStatsStore = readPrivateStatsStore(),
): ToolStatsSummary {
  const bucket = store.tools[toolSlug] ?? emptyToolStats();

  const popularQuestions = Object.entries(bucket.questions)
    .map(([questionId, stats]) => {
      let topOption: AnswerKey | null = null;
      let topOptionCount = 0;
      for (const [opt, count] of Object.entries(stats.options)) {
        if (count > topOptionCount) {
          topOption = opt;
          topOptionCount = count;
        }
      }
      return {
        questionId,
        answered: stats.answered,
        topOption,
        topOptionCount,
      };
    })
    .sort((a, b) => b.answered - a.answered);

  const modes = Object.entries(bucket.modes)
    .map(([mode, stats]) => ({
      mode,
      started: stats.started,
      completed: stats.completed,
      completionRate: rate(stats.completed, stats.started),
    }))
    .sort((a, b) => b.started - a.started);

  const topOutcomes = Object.entries(bucket.outcomes)
    .map(([outcome, count]) => ({ outcome, count }))
    .sort((a, b) => b.count - a.count);

  return {
    toolSlug,
    opens: getToolOpenCount(bucket),
    started: bucket.started,
    completed: bucket.completed,
    completionRate: rate(bucket.completed, bucket.started),
    popularQuestions,
    modes,
    topOutcomes,
  };
}

export function summarizeAllTools(
  store: PrivateStatsStore = readPrivateStatsStore(),
): ToolStatsSummary[] {
  return (Object.keys(store.tools) as ToolSlug[])
    .map((slug) => summarizeToolStats(slug, store))
    .sort((a, b) => b.opens - a.opens || b.started - a.started);
}

/** Include every registered tool (zeros for unused) for admin dashboards. */
export function summarizeRegisteredTools(
  toolSlugs: ToolSlug[],
  store: PrivateStatsStore = readPrivateStatsStore(),
): ToolStatsSummary[] {
  return toolSlugs
    .map((slug) => summarizeToolStats(slug, store))
    .sort((a, b) => b.opens - a.opens || b.started - a.started);
}

export function getPrivateStatsOverview(
  store: PrivateStatsStore = readPrivateStatsStore(),
): PrivateStatsOverview {
  let opens = 0;
  let started = 0;
  let completed = 0;
  let toolsWithActivity = 0;

  for (const bucket of Object.values(store.tools)) {
    if (!bucket) continue;
    const toolOpens = getToolOpenCount(bucket);
    opens += toolOpens;
    started += bucket.started;
    completed += bucket.completed;
    if (toolOpens > 0 || bucket.started > 0 || bucket.completed > 0) {
      toolsWithActivity += 1;
    }
  }

  return {
    opens,
    started,
    completed,
    completionRate: rate(completed, started),
    toolsWithActivity,
    updatedAt: store.updatedAt || null,
  };
}

/** JSON snapshot for local review / download — still anonymous aggregates only. */
export function exportPrivateStatsJson(
  store: PrivateStatsStore = readPrivateStatsStore(),
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      privacy: "local-anonymous-aggregates-only",
      store,
      summaries: summarizeAllTools(store),
    },
    null,
    2,
  );
}

export function downloadPrivateStatsFile(
  filename = "dailylogic-private-stats.json",
): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([exportPrivateStatsJson()], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
