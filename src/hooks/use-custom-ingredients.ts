"use client";

import { useCallback, useMemo } from "react";
import {
  createCustomIngredient,
  CUSTOM_INGREDIENTS_STORAGE_KEY,
  findIngredientByExactName,
  normalizeCustomIngredients,
  type CustomIngredient,
} from "@/lib/custom-ingredients";
import type { IngredientLibraryItem } from "@/lib/ingredients-data";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function useCustomIngredients() {
  const [rawCustoms, setRawCustoms, isHydrated] = useLocalStorage<
    CustomIngredient[]
  >(CUSTOM_INGREDIENTS_STORAGE_KEY, []);

  const customs = useMemo(
    () => normalizeCustomIngredients(rawCustoms),
    [rawCustoms],
  );

  const addCustom = useCallback(
    (
      name: string,
      localizedNameById?: Record<string, string>,
    ): IngredientLibraryItem | undefined => {
      const existing = findIngredientByExactName(
        name,
        customs,
        localizedNameById,
      );
      if (existing) return existing;

      const created = createCustomIngredient(name);
      if (!created.name) return undefined;

      setRawCustoms((prev) => [created, ...normalizeCustomIngredients(prev)]);
      return created;
    },
    [customs, setRawCustoms],
  );

  return { customs, addCustom, isHydrated };
}
