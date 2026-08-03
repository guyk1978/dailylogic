import type { ToolCategory, ToolSlug } from "@/lib/tools-registry";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const TOOL_OG_ACCENT: Record<
  ToolCategory,
  { from: string; to: string; chip: string; soft: string }
> = {
  finance: {
    from: "#eff6ff",
    to: "#dbeafe",
    chip: "#2563eb",
    soft: "#93c5fd",
  },
  kitchen: {
    from: "#fffbeb",
    to: "#fef3c7",
    chip: "#d97706",
    soft: "#fcd34d",
  },
  shopping: {
    from: "#ecfdf5",
    to: "#d1fae5",
    chip: "#059669",
    soft: "#6ee7b7",
  },
  life: {
    from: "#fff1f2",
    to: "#ffe4e6",
    chip: "#e11d48",
    soft: "#fda4af",
  },
};

export const TOOL_OG_EMOJI: Record<ToolSlug, string> = {
  "budget-simple": "📊",
  "time-value": "⏱️",
  "tip-split": "💵",
  "recipe-adjuster": "🍳",
  "unit-compare": "🛒",
  "love-calculator": "💛",
  "relationship-depth": "🤝",
  "business-partnership-calculator": "📑",
  "pocket-money-calculator": "🪙",
  "dog-ownership-calculator": "🐕",
  "parent-respect-calculator": "👨‍👩‍👧",
  "stranger-sharing-calculator": "🗣️",
};

export function toolOgImagePath(locale: string, slug: string): string {
  return `/${locale}/tool/${slug}/opengraph-image`;
}

/**
 * Satori (next/og) paints glyphs left-to-right and mishandles CSS `direction: rtl`
 * (it reverses characters but does not flip layout). For Hebrew, convert logical
 * text to visual order and right-align in the layout instead.
 */
export function satoriVisualText(text: string, rtl: boolean): string {
  if (!rtl || !text) return text;
  return [...text].reverse().join("");
}
