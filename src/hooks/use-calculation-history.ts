"use client";

import { useCallback } from "react";
import {
  CALCULATION_HISTORY_KEY,
  DEFAULT_CALCULATION_NAME,
  MAX_CALCULATION_HISTORY,
  getCalculationEntryById,
  normalizeCalculationEntry,
  type CalculationHistoryEntry,
} from "@/lib/calculation-history";
import { useLocalStorage } from "@/hooks/use-local-storage";

type NewCalculationEntry = Omit<
  CalculationHistoryEntry,
  "id" | "timestamp" | "name"
> & {
  name?: string;
};

export function useCalculationHistory() {
  const [history, setHistory, isHydrated] = useLocalStorage<
    CalculationHistoryEntry[]
  >(CALCULATION_HISTORY_KEY, []);

  const addEntry = useCallback(
    (entry: NewCalculationEntry): string => {
      const id = crypto.randomUUID();
      const newEntry = normalizeCalculationEntry({
        ...entry,
        id,
        name: entry.name?.trim() || DEFAULT_CALCULATION_NAME,
        timestamp: Date.now(),
      });

      setHistory((prev) =>
        [newEntry, ...prev.filter((item) => item.id !== newEntry.id)].slice(
          0,
          MAX_CALCULATION_HISTORY,
        ),
      );

      return id;
    },
    [setHistory],
  );

  const removeEntry = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    },
    [setHistory],
  );

  const getEntryById = useCallback(
    (id: string) => {
      const fromState = history.find((entry) => entry.id === id);
      if (fromState) return normalizeCalculationEntry(fromState);
      return getCalculationEntryById(id);
    },
    [history],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const normalizedHistory = history.map(normalizeCalculationEntry);

  return {
    history: normalizedHistory,
    addEntry,
    removeEntry,
    getEntryById,
    clearHistory,
    isHydrated,
  };
}
