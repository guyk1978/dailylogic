import type { ComponentType } from "react";

export type ToolCategory = "finance" | "kitchen" | "shopping" | "life";

export type ToolSlug =
  | "time-value"
  | "tip-split"
  | "recipe-adjuster"
  | "budget-simple"
  | "unit-compare"
  | "love-calculator"
  | "relationship-depth"
  | "business-partnership-calculator"
  | "pocket-money-calculator"
  | "dog-ownership-calculator"
  | "parent-respect-calculator"
  | "stranger-sharing-calculator";

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
  life: {
    label: "Everyday Life",
    description: "Small joys, moods, and everyday wit",
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
  {
    meta: {
      slug: "love-calculator",
      name: "Everyday Love Calculator",
      description:
        "Cross your small joys, tiny vices, and mood for a witty life-synergy score.",
      category: "life",
      tags: ["life", "mood", "fun", "synergy"],
    },
    loadComponent: () =>
      import("@/components/tools/love-calculator").then((m) => ({
        default: m.LoveCalculator,
      })),
  },
  {
    meta: {
      slug: "relationship-depth",
      name: "Relationship Depth Assessment",
      description:
        "Honest partnership questionnaire with resilience, communication, space, and growth scores.",
      category: "life",
      tags: ["relationship", "quiz", "communication", "depth"],
    },
    loadComponent: () =>
      import("@/components/tools/relationship-depth").then((m) => ({
        default: m.RelationshipDepth,
      })),
  },
  {
    meta: {
      slug: "business-partnership-calculator",
      name: "Business Partnership Calculator",
      description:
        "Honest venture-partner assessment with setup wizard, industry-aware questions, and founder-agreement prompts.",
      category: "finance",
      tags: ["business", "partnership", "equity", "founders"],
    },
    loadComponent: () =>
      import("@/components/tools/business-partnership").then((m) => ({
        default: m.BusinessPartnershipCalculator,
      })),
  },
  {
    meta: {
      slug: "pocket-money-calculator",
      name: "Pocket Money Calculator",
      description:
        "Family allowance plan with age-aware setup, spend/save/give split, and practical partnership habits.",
      category: "finance",
      tags: ["kids", "allowance", "family", "saving", "education"],
    },
    loadComponent: () =>
      import("@/components/tools/pocket-money").then((m) => ({
        default: m.PocketMoneyCalculator,
      })),
  },
  {
    meta: {
      slug: "dog-ownership-calculator",
      name: "Dog Care & Budget Calculator",
      description:
        "Honest dog ownership costs by size and lifestyle, plus a readiness quiz and monthly budget.",
      category: "life",
      tags: ["dog", "pet", "budget", "vet", "ownership"],
    },
    loadComponent: () =>
      import("@/components/tools/dog-ownership").then((m) => ({
        default: m.DogOwnershipCalculator,
      })),
  },
  {
    meta: {
      slug: "parent-respect-calculator",
      name: "Parent Respect Calculator",
      description:
        "Honest parent–adult connection quiz with presence, listening, and emotional-balance scores.",
      category: "life",
      tags: ["family", "parents", "respect", "connection", "balance"],
    },
    loadComponent: () =>
      import("@/components/tools/parent-respect").then((m) => ({
        default: m.ParentRespectCalculator,
      })),
  },
  {
    meta: {
      slug: "stranger-sharing-calculator",
      name: "Stranger Sharing Calculator",
      description:
        "Boundary-smart small talk quiz: privacy guard, social grace, and gut instinct with strangers.",
      category: "life",
      tags: ["privacy", "social", "boundaries", "small-talk", "oversharing"],
    },
    loadComponent: () =>
      import("@/components/tools/stranger-sharing").then((m) => ({
        default: m.StrangerSharingCalculator,
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
