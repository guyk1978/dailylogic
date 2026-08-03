"use client";

import { useCallback } from "react";
import type { ToolSlug } from "@/lib/tools-registry";
import {
  trackChoice,
  trackQuestionAnswer,
  trackToolComplete,
  trackToolStart,
} from "@/lib/analytics/private-stats";

/**
 * Anonymous private usage stats for a single tool.
 * Safe to call from quiz/calculator UI — never stores PII.
 */
export function usePrivateToolStats(toolSlug: ToolSlug) {
  const trackStart = useCallback(
    (options?: { mode?: string }) => {
      trackToolStart(toolSlug, options);
    },
    [toolSlug],
  );

  const trackAnswer = useCallback(
    (questionId: string, value: string | number | boolean) => {
      trackQuestionAnswer(toolSlug, questionId, value);
    },
    [toolSlug],
  );

  const trackSetupChoice = useCallback(
    (choiceId: string, value: string | number | boolean) => {
      trackChoice(toolSlug, choiceId, value);
    },
    [toolSlug],
  );

  const trackComplete = useCallback(
    (options?: { mode?: string; outcome?: string }) => {
      trackToolComplete(toolSlug, options);
    },
    [toolSlug],
  );

  return {
    trackStart,
    trackAnswer,
    trackSetupChoice,
    trackComplete,
  };
}
