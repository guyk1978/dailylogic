"use client";

import { useCallback } from "react";
import { useAppLocale } from "@/hooks/use-locale-direction";
import { localizedPath } from "@/lib/i18n/paths";

/** Returns a function that prefixes paths with the active locale. */
export function useLocalizedPath() {
  const locale = useAppLocale();

  return useCallback((path: string) => localizedPath(path, locale), [locale]);
}
