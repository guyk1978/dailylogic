"use client";

import { useCallback } from "react";
import { useTranslation } from "@/lib/i18n/provider";
import {
  TOOL_I18N_NAMESPACE,
  type ToolI18nNamespace,
} from "@/lib/i18n/tool-namespaces";
import type { ToolSlug } from "@/lib/tools-registry";

export function useToolTranslation(slug: ToolSlug) {
  const namespace = TOOL_I18N_NAMESPACE[slug] as ToolI18nNamespace;
  const { t, i18n } = useTranslation([namespace, "common"]);

  const tt = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      t(key, { ns: namespace, ...options }),
    [t, namespace],
  );

  const tc = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      t(`toolsCommon.${key}`, { ns: "common", ...options }),
    [t],
  );

  return { t: tt, tc, i18n, namespace };
}
