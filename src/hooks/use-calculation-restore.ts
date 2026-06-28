"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getCalculationEntryById } from "@/lib/calculation-history";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";
import type { ToolSlug } from "@/lib/tools-registry";

export function useCalculationRestore(
  slug: ToolSlug,
  onRestore: (entry: CalculationHistoryEntry) => void,
) {
  const searchParams = useSearchParams();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;

    const restoreId = searchParams.get("restore");
    if (!restoreId) return;

    const entry = getCalculationEntryById(restoreId);
    if (entry?.toolSlug === slug) {
      onRestore(entry);
      restoredRef.current = true;
    }
  }, [slug, searchParams, onRestore]);
}
