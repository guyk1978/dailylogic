import type { IngredientLibraryItem } from "@/lib/ingredients-data";
import { INGREDIENTS_LIBRARY } from "@/lib/ingredients-data";

export const CUSTOM_INGREDIENTS_STORAGE_KEY =
  "tool:recipe-adjuster:custom-ingredients";

/** Library category string used for user-created ingredients. */
export const CUSTOM_LIBRARY_CATEGORY = "Custom";

export const CUSTOM_ID_PREFIX = "custom:";

export interface CustomIngredient extends IngredientLibraryItem {
  createdAt: number;
}

export function isCustomIngredientId(id: string): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX);
}

export function createCustomIngredient(name: string): CustomIngredient {
  const trimmed = name.trim().replace(/\s+/g, " ");
  return {
    id: `${CUSTOM_ID_PREFIX}${crypto.randomUUID()}`,
    name: trimmed,
    icon: "CirclePlus",
    category: CUSTOM_LIBRARY_CATEGORY,
    createdAt: Date.now(),
  };
}

export function normalizeCustomIngredients(
  value: unknown,
): CustomIngredient[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: CustomIngredient[] = [];

  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id : "";
    const name = typeof record.name === "string" ? record.name.trim() : "";
    if (!id || !isCustomIngredientId(id) || !name) continue;
    if (seen.has(id)) continue;
    seen.add(id);

    result.push({
      id,
      name: name.replace(/\s+/g, " "),
      icon:
        typeof record.icon === "string" && record.icon
          ? record.icon
          : "CirclePlus",
      category: CUSTOM_LIBRARY_CATEGORY,
      createdAt:
        typeof record.createdAt === "number" && Number.isFinite(record.createdAt)
          ? record.createdAt
          : Date.now(),
    });
  }

  return result.sort((a, b) => b.createdAt - a.createdAt);
}

export function findIngredientByExactName(
  name: string,
  extras: IngredientLibraryItem[] = [],
  localizedNameById?: Record<string, string>,
): IngredientLibraryItem | undefined {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return undefined;

  const catalog = [...INGREDIENTS_LIBRARY, ...extras];
  return catalog.find((item) => {
    if (item.name.toLowerCase() === normalized) return true;
    const localized = localizedNameById?.[item.id];
    return Boolean(localized && localized.toLowerCase() === normalized);
  });
}

export function resolveIngredient(
  id: string,
  extras: IngredientLibraryItem[] = [],
): IngredientLibraryItem | undefined {
  if (!id) return undefined;
  const fromLibrary = INGREDIENTS_LIBRARY.find((item) => item.id === id);
  if (fromLibrary) return fromLibrary;
  return extras.find((item) => item.id === id);
}
