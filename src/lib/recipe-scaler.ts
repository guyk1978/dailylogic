import type { IngredientLibraryItem, IngredientUnit } from "@/lib/ingredients-data";
import { getUnitForIngredient } from "@/lib/ingredients-data";

export type RecipeAmountUnit = IngredientUnit;

export type RecipeIngredientCategory =
  | "meat"
  | "dairy"
  | "vegetables"
  | "fruits"
  | "spices"
  | "substitutes"
  | "other";

export const RECIPE_UNIT_OPTIONS: { value: RecipeAmountUnit; label: string }[] =
  [
    { value: "cups", label: "Cups" },
    { value: "g", label: "g" },
    { value: "ml", label: "ml" },
    { value: "tbsp", label: "tbsp" },
    { value: "tsp", label: "tsp" },
    { value: "pieces", label: "unit" },
  ];

export const RECIPE_CATEGORY_ORDER: RecipeIngredientCategory[] = [
  "meat",
  "dairy",
  "vegetables",
  "fruits",
  "spices",
  "substitutes",
  "other",
];

export const RECIPE_CATEGORY_META: Record<
  RecipeIngredientCategory,
  { label: string; badge: string; header: string }
> = {
  meat: {
    label: "Meat",
    badge: "bg-rose-100 text-rose-700 ring-rose-200",
    header: "border-rose-200 text-rose-800",
  },
  dairy: {
    label: "Dairy",
    badge: "bg-sky-100 text-sky-700 ring-sky-200",
    header: "border-sky-200 text-sky-800",
  },
  vegetables: {
    label: "Vegetables",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    header: "border-emerald-200 text-emerald-800",
  },
  fruits: {
    label: "Fruits",
    badge: "bg-orange-100 text-orange-700 ring-orange-200",
    header: "border-orange-200 text-orange-800",
  },
  spices: {
    label: "Spices",
    badge: "bg-amber-100 text-amber-800 ring-amber-200",
    header: "border-amber-200 text-amber-900",
  },
  substitutes: {
    label: "Substitutes",
    badge: "bg-violet-100 text-violet-700 ring-violet-200",
    header: "border-violet-200 text-violet-800",
  },
  other: {
    label: "Other",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    header: "border-slate-200 text-slate-700",
  },
};

const LIBRARY_CATEGORY_MAP: Record<string, RecipeIngredientCategory> = {
  Proteins: "meat",
  Dairy: "dairy",
  Vegetables: "vegetables",
  Fruits: "fruits",
  "Spices & Herbs": "spices",
  "Oils & Condiments": "substitutes",
};

export function mapLibraryToRecipeCategory(
  libraryCategory: string,
): RecipeIngredientCategory {
  return LIBRARY_CATEGORY_MAP[libraryCategory] ?? "other";
}

export function defaultUnitForIngredient(
  item: IngredientLibraryItem,
): RecipeAmountUnit {
  return getUnitForIngredient(item);
}

export function formatRecipeUnit(unit: RecipeAmountUnit, value: number): string {
  const amount = Number.isInteger(value)
    ? value.toLocaleString()
    : parseFloat(value.toFixed(2)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });

  if (unit === "pieces") {
    return `${amount} ${value === 1 ? "unit" : "units"}`;
  }

  return `${amount} ${unit}`;
}

export function formatRecipeLine(
  name: string,
  unit: RecipeAmountUnit,
  value: number,
): string {
  const amount = Number.isInteger(value)
    ? value.toLocaleString()
    : parseFloat(value.toFixed(2)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });

  const attached =
    unit === "g" || unit === "ml" || unit === "tbsp" || unit === "tsp";

  if (attached) {
    return `${amount}${unit} ${name}`;
  }

  if (unit === "pieces") {
    return `${amount} ${value === 1 ? "unit" : "units"} ${name}`;
  }

  return `${amount} ${unit} ${name}`;
}

export function buildCompiledRecipeText(
  groups: { label: string; lines: string[] }[],
  meta?: { targetYield: string; factorLabel: string },
): string {
  const header = meta
    ? `Scaled recipe (${meta.targetYield} servings · ${meta.factorLabel})\n`
    : "Scaled recipe\n";

  const body = groups
    .map((group) => {
      if (group.lines.length === 0) return "";
      return `${group.label}\n${group.lines.map((line) => `• ${line}`).join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return `${header}${body}`.trim();
}

export function normalizeRecipeUnit(value: unknown): RecipeAmountUnit {
  const units: RecipeAmountUnit[] = [
    "cups",
    "g",
    "ml",
    "tbsp",
    "tsp",
    "pieces",
  ];
  if (typeof value === "string" && units.includes(value as RecipeAmountUnit)) {
    return value as RecipeAmountUnit;
  }
  return "cups";
}

export function normalizeRecipeCategory(
  value: unknown,
): RecipeIngredientCategory {
  if (
    typeof value === "string" &&
    RECIPE_CATEGORY_ORDER.includes(value as RecipeIngredientCategory)
  ) {
    return value as RecipeIngredientCategory;
  }
  return "other";
}
