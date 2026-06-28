import { useMemo } from "react";
import { useAppLocale } from "@/hooks/use-locale-direction";
import { getToolSeoContent } from "@/lib/seo/tool-seo";
import type { ToolSlug } from "@/lib/tools-registry";

export function useToolSeo(toolSlug: ToolSlug) {
  const locale = useAppLocale();

  return useMemo(
    () => getToolSeoContent(toolSlug, locale),
    [toolSlug, locale],
  );
}
