"use client";

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { ToolSlug } from "@/lib/tools-registry";

const FAVORITES_STORAGE_KEY = "dailylogic:favorites";

export function useFavorites() {
  const [favorites, setFavorites, isHydrated] = useLocalStorage<ToolSlug[]>(
    FAVORITES_STORAGE_KEY,
    [],
  );

  const isFavorite = useCallback(
    (slug: ToolSlug) => favorites.includes(slug),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (slug: ToolSlug) => {
      setFavorites((prev) =>
        prev.includes(slug)
          ? prev.filter((item) => item !== slug)
          : [...prev, slug],
      );
    },
    [setFavorites],
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isHydrated,
  };
}
