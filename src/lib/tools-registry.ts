import type { ComponentType } from "react";

export type ToolCategory = "finance" | "kitchen" | "shopping";

export type ToolSlug =
  | "time-value"
  | "tip-split"
  | "recipe-adjuster"
  | "budget-simple"
  | "unit-compare";

export interface ToolMeta {
  slug: ToolSlug;
  name: string;
  description: string;
  category: ToolCategory;
  tags?: string[];
}

export interface ToolEntry {
  meta: ToolMeta;
  loadComponent: () => Promise<{ default: ComponentType }>;
}

export const toolCategories: Record<
  ToolCategory,
  { label: string; description: string }
> = {
  finance: {
    label: "Personal Finance",
    description: "Budget, bills, and money decisions",
  },
  kitchen: {
    label: "Home & Kitchen",
    description: "Cooking and meal planning helpers",
  },
  shopping: {
    label: "Smart Shopping",
    description: "Compare prices and shop smarter",
  },
};

export const toolsRegistry: ToolEntry[] = [
  {
    meta: {
      slug: "budget-simple",
      name: "Budget Planner",
      description: "Strategic monthly plan with gap analysis and user-driven trade-offs.",
      category: "finance",
      tags: ["budget", "savings", "planning"],
    },
    loadComponent: () =>
      import("@/components/tools/budget-simple").then((m) => ({
        default: m.BudgetPlanner,
      })),
  },
  {
    meta: {
      slug: "time-value",
      name: "Delegate or Do",
      description: "Decision matrix for DIY vs hiring a professional.",
      category: "finance",
      tags: ["time", "money", "decision"],
    },
    loadComponent: () =>
      import("@/components/tools/time-value").then((m) => ({
        default: m.TimeValue,
      })),
  },
  {
    meta: {
      slug: "tip-split",
      name: "Smart Tip Assistant",
      description: "Context-aware tip suggestions and bill splitting.",
      category: "finance",
      tags: ["tip", "bill", "split"],
    },
    loadComponent: () =>
      import("@/components/tools/tip-split").then((m) => ({
        default: m.TipSplit,
      })),
  },
  {
    meta: {
      slug: "recipe-adjuster",
      name: "Recipe Scaler",
      description: "Scale your recipes up or down instantly.",
      category: "kitchen",
      tags: ["recipe", "cooking", "scale"],
    },
    loadComponent: () =>
      import("@/components/tools/recipe-adjuster").then((m) => ({
        default: m.RecipeAdjuster,
      })),
  },
  {
    meta: {
      slug: "unit-compare",
      name: "Smart Shopping Assistant",
      description: "Compare multiple brands by unit price and build your shopping list.",
      category: "shopping",
      tags: ["shopping", "compare", "price"],
    },
    loadComponent: () =>
      import("@/components/tools/unit-compare").then((m) => ({
        default: m.UnitCompare,
      })),
  },
];

export function getToolBySlug(slug: string): ToolEntry | undefined {
  return toolsRegistry.find((entry) => entry.meta.slug === slug);
}

export function getAllTools(): ToolEntry[] {
  return toolsRegistry;
}

export function getAllSlugs(): string[] {
  return toolsRegistry.map((entry) => entry.meta.slug);
}
