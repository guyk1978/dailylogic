"use client";

import { useCallback, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/provider";
import {
  getIngredientById,
  getIngredientCategories,
  INGREDIENTS_LIBRARY,
  type IngredientLibraryItem,
} from "@/lib/ingredients-data";
import { libraryCategoryI18nKey } from "@/lib/ingredient-library-i18n";
import { isCustomIngredientId } from "@/lib/custom-ingredients";

/**
 * Localized ingredient library labels (names + categories) for recipe tools.
 */
export function useIngredientLabels(extras: IngredientLibraryItem[] = []) {
  const { t, i18n } = useTranslation(["ingredients", "recipeAdjuster"]);

  const getName = useCallback(
    (ingredientId: string, fallback?: string) => {
      if (isCustomIngredientId(ingredientId)) {
        return (
          fallback ??
          extras.find((item) => item.id === ingredientId)?.name ??
          ingredientId
        );
      }

      const key = `names.${ingredientId}`;
      const translated = t(key, { ns: "ingredients" });
      if (translated && translated !== key) return translated;
      return (
        fallback ??
        getIngredientById(ingredientId)?.name ??
        ingredientId
      );
    },
    [t, extras],
  );

  const getCategoryLabel = useCallback(
    (libraryCategory: string) => {
      const key = libraryCategoryI18nKey(libraryCategory);
      if (!key.startsWith("libraryCategories.")) return libraryCategory;
      return t(key, { ns: "recipeAdjuster" });
    },
    [t],
  );

  const nameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const item of INGREDIENTS_LIBRARY) {
      map[item.id] = getName(item.id, item.name);
    }
    for (const item of extras) {
      map[item.id] = getName(item.id, item.name);
    }
    return map;
  }, [getName, extras, i18n.language]);

  const categoryLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const category of getIngredientCategories(extras)) {
      map[category] = getCategoryLabel(category);
    }
    return map;
  }, [getCategoryLabel, extras, i18n.language]);

  const searchLabels = useMemo(
    () => ({ categoryLabels, nameById }),
    [categoryLabels, nameById],
  );

  return { getName, getCategoryLabel, nameById, categoryLabels, searchLabels };
}
