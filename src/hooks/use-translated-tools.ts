"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  getAllTools,
  type ToolCategory,
  type ToolMeta,
  type ToolSlug,
} from "@/lib/tools-registry";

export interface TranslatedToolMeta extends ToolMeta {
  name: string;
  description: string;
}

export function useTranslatedTool(slug: ToolSlug): TranslatedToolMeta | null {
  const { t } = useTranslation("common");
  const entry = getAllTools().find((tool) => tool.meta.slug === slug);
  if (!entry) return null;

  return {
    ...entry.meta,
    name: t(`tools.${slug}.name`),
    description: t(`tools.${slug}.description`),
  };
}

export function useTranslatedTools(): TranslatedToolMeta[] {
  const { t } = useTranslation("common");

  return useMemo(
    () =>
      getAllTools().map((entry) => ({
        ...entry.meta,
        name: t(`tools.${entry.meta.slug}.name`),
        description: t(`tools.${entry.meta.slug}.description`),
      })),
    [t],
  );
}

export function useTranslatedCategories(): Record<
  ToolCategory,
  { label: string; description: string }
> {
  const { t } = useTranslation("common");

  return useMemo(
    () => ({
      finance: {
        label: t("categories.finance.label"),
        description: t("categories.finance.description"),
      },
      kitchen: {
        label: t("categories.kitchen.label"),
        description: t("categories.kitchen.description"),
      },
      shopping: {
        label: t("categories.shopping.label"),
        description: t("categories.shopping.description"),
      },
    }),
    [t],
  );
}
