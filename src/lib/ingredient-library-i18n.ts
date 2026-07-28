/**
 * Stable keys for ingredient-library category labels (combobox groups, search).
 * English display names in `ingredients-data` stay as data IDs; UI uses these keys.
 */
export const LIBRARY_CATEGORY_KEYS = [
  "staples",
  "vegetables",
  "fruits",
  "proteins",
  "spicesAndHerbs",
  "dairy",
  "baking",
  "oilsAndCondiments",
  "custom",
] as const;

export type LibraryCategoryKey = (typeof LIBRARY_CATEGORY_KEYS)[number];

/** Maps raw library category strings → i18n keys under `libraryCategories.*`. */
export const LIBRARY_CATEGORY_TO_KEY: Record<string, LibraryCategoryKey> = {
  Staples: "staples",
  Vegetables: "vegetables",
  Fruits: "fruits",
  Proteins: "proteins",
  "Spices & Herbs": "spicesAndHerbs",
  Dairy: "dairy",
  Baking: "baking",
  "Oils & Condiments": "oilsAndCondiments",
  Custom: "custom",
};

export function libraryCategoryKey(
  libraryCategory: string,
): LibraryCategoryKey | null {
  return LIBRARY_CATEGORY_TO_KEY[libraryCategory] ?? null;
}

/** i18n path for a library category label, e.g. `libraryCategories.staples`. */
export function libraryCategoryI18nKey(libraryCategory: string): string {
  const key = libraryCategoryKey(libraryCategory);
  return key ? `libraryCategories.${key}` : libraryCategory;
}
