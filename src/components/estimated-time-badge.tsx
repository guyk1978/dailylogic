"use client";

import { Clock } from "lucide-react";
import { ICON_STROKE_WIDTH } from "@/lib/tool-icons";

interface EstimatedTimeBadgeProps {
  /** Localized label, e.g. "כדקה אחת" / "~1 min" */
  label: string;
  className?: string;
  /** Visual tone to match the surrounding card */
  tone?: "sky" | "slate" | "emerald" | "neutral";
}

const TONE_CLASSES: Record<
  NonNullable<EstimatedTimeBadgeProps["tone"]>,
  string
> = {
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  slate: "bg-slate-50 text-slate-600 ring-slate-200/80",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  neutral: "bg-white/90 text-slate-600 ring-slate-200/70",
};

/**
 * Clean estimated-time chip for quizzes and puzzles.
 * Uses a Clock icon — never raw "<" characters that break in RTL.
 */
export function EstimatedTimeBadge({
  label,
  className = "",
  tone = "neutral",
}: EstimatedTimeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-tight ring-1 ${TONE_CLASSES[tone]} ${className}`.trim()}
    >
      <Clock
        className="h-3.5 w-3.5 shrink-0 opacity-80"
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}

interface ElapsedTimerBadgeProps {
  /** Elapsed seconds */
  seconds: number;
  className?: string;
  tone?: EstimatedTimeBadgeProps["tone"];
  /** Accessible label prefix from i18n */
  ariaLabel: string;
}

function formatElapsed(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Compact live elapsed timer for an active quiz/puzzle session. */
export function ElapsedTimerBadge({
  seconds,
  className = "",
  tone = "sky",
  ariaLabel,
}: ElapsedTimerBadgeProps) {
  return (
    <span
      role="timer"
      aria-live="off"
      aria-label={`${ariaLabel}: ${formatElapsed(seconds)}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-tight ring-1 ${TONE_CLASSES[tone ?? "sky"]} ${className}`.trim()}
    >
      <Clock
        className="h-3.5 w-3.5 shrink-0 opacity-80"
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden
      />
      <span>{formatElapsed(seconds)}</span>
    </span>
  );
}
