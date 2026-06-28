import type { ToolSlug } from "@/lib/tools-registry";

export const CALCULATION_HISTORY_KEY = "dailylogic:calculation-history";
export const MAX_CALCULATION_HISTORY = 20;
export const DEFAULT_CALCULATION_NAME = "Untitled Calculation";

export interface CalculationHistoryEntry {
  id: string;
  toolSlug: ToolSlug;
  toolName: string;
  name: string;
  timestamp: number;
  inputs: Record<string, unknown>;
  resultSummary: string;
}

export function getEntryDisplayName(entry: CalculationHistoryEntry): string {
  return entry.name?.trim() || DEFAULT_CALCULATION_NAME;
}

export function normalizeCalculationEntry(
  entry: CalculationHistoryEntry,
): CalculationHistoryEntry {
  return {
    ...entry,
    name: entry.name?.trim() || DEFAULT_CALCULATION_NAME,
  };
}

export function getCalculationEntryById(
  id: string,
): CalculationHistoryEntry | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(CALCULATION_HISTORY_KEY);
    if (!raw) return undefined;
    const entries = JSON.parse(raw) as CalculationHistoryEntry[];
    const entry = entries.find((item) => item.id === id);
    return entry ? normalizeCalculationEntry(entry) : undefined;
  } catch {
    return undefined;
  }
}

export function formatHistoryDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function buildRestoreUrl(slug: ToolSlug, entryId: string): string {
  return `/tool/${slug}?restore=${entryId}`;
}
