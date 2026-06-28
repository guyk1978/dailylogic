"use client";

import { useMemo } from "react";
import { getLocalizedToolLanding } from "@/lib/content/tool-landing-registry";
import { useAppLocale } from "@/hooks/use-locale-direction";

export function useLocalizedToolLanding(slug: string) {
  const locale = useAppLocale();

  return useMemo(
    () => getLocalizedToolLanding(slug, locale),
    [slug, locale],
  );
}
