import type { IngredientLibraryItem, IngredientUnit } from "@/lib/ingredients-data";
import { getUnitForIngredient } from "@/lib/ingredients-data";

export type RecipeAmountUnit = IngredientUnit;

export type RecipeIngredientCategory =
  | "staples"
  | "meat"
  | "dairy"
  | "vegetables"
  | "fruits"
  | "spices"
  | "baking"
  | "substitutes"
  | "other";

/** Unit option values only — display labels come from i18n `units.*`. */
export const RECIPE_UNIT_OPTIONS: { value: RecipeAmountUnit }[] = [
  { value: "cups" },
  { value: "g" },
  { value: "ml" },
  { value: "tbsp" },
  { value: "tsp" },
  { value: "pieces" },
];

export const RECIPE_CATEGORY_ORDER: RecipeIngredientCategory[] = [
  "staples",
  "meat",
  "dairy",
  "vegetables",
  "fruits",
  "spices",
  "baking",
  "substitutes",
  "other",
];

export const RECIPE_CATEGORY_META: Record<
  RecipeIngredientCategory,
  { badge: string; header: string }
> = {
  staples: {
    badge: "bg-stone-100 text-stone-700 ring-stone-200",
    header: "border-stone-200 text-stone-800",
  },
  meat: {
    badge: "bg-rose-100 text-rose-700 ring-rose-200",
    header: "border-rose-200 text-rose-800",
  },
  dairy: {
    badge: "bg-sky-100 text-sky-700 ring-sky-200",
    header: "border-sky-200 text-sky-800",
  },
  vegetables: {
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    header: "border-emerald-200 text-emerald-800",
  },
  fruits: {
    badge: "bg-orange-100 text-orange-700 ring-orange-200",
    header: "border-orange-200 text-orange-800",
  },
  spices: {
    badge: "bg-amber-100 text-amber-800 ring-amber-200",
    header: "border-amber-200 text-amber-900",
  },
  baking: {
    badge: "bg-yellow-100 text-yellow-800 ring-yellow-200",
    header: "border-yellow-200 text-yellow-900",
  },
  substitutes: {
    badge: "bg-violet-100 text-violet-700 ring-violet-200",
    header: "border-violet-200 text-violet-800",
  },
  other: {
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    header: "border-slate-200 text-slate-700",
  },
};

const LIBRARY_CATEGORY_MAP: Record<string, RecipeIngredientCategory> = {
  Staples: "staples",
  Proteins: "meat",
  Dairy: "dairy",
  Vegetables: "vegetables",
  Fruits: "fruits",
  "Spices & Herbs": "spices",
  Baking: "baking",
  "Oils & Condiments": "substitutes",
  Custom: "other",
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

export function formatRecipeUnit(
  unit: RecipeAmountUnit,
  value: number,
  unitLabel: string,
): string {
  const amount = Number.isInteger(value)
    ? value.toLocaleString()
    : parseFloat(value.toFixed(2)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });

  return `${amount} ${unitLabel}`;
}

export function formatRecipeLine(
  name: string,
  unit: RecipeAmountUnit,
  value: number,
  unitLabel: string,
): string {
  const amount = Number.isInteger(value)
    ? value.toLocaleString()
    : parseFloat(value.toFixed(2)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });

  const attached =
    unit === "g" || unit === "ml" || unit === "tbsp" || unit === "tsp";

  if (attached) {
    return `${amount}${unitLabel} ${name}`;
  }

  return `${amount} ${unitLabel} ${name}`;
}

export function buildCompiledRecipeText(
  groups: { label: string; lines: string[] }[],
  header: string,
): string {
  const body = groups
    .map((group) => {
      if (group.lines.length === 0) return "";
      return `${group.label}\n${group.lines.map((line) => `• ${line}`).join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return `${header}\n${body}`.trim();
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
