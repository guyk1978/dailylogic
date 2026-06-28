"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { CalculationSavePanel } from "@/components/tools/calculation-save-panel";
import { useCalculationRestore } from "@/hooks/use-calculation-restore";
import { useToolTranslation } from "@/hooks/use-tool-translation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";
import { getIngredientById, INGREDIENTS_LIBRARY } from "@/lib/ingredients-data";
import {
  IngredientCombobox,
  IngredientIconBadge,
} from "@/components/tools/ingredient-combobox";
import {
  buildCompiledRecipeText,
  defaultUnitForIngredient,
  formatRecipeLine,
  mapLibraryToRecipeCategory,
  normalizeRecipeCategory,
  normalizeRecipeUnit,
  RECIPE_CATEGORY_META,
  RECIPE_CATEGORY_ORDER,
  RECIPE_UNIT_OPTIONS,
  type RecipeAmountUnit,
  type RecipeIngredientCategory,
} from "@/lib/recipe-scaler";

interface IngredientRow {
  id: string;
  ingredientId: string;
  amount: string;
  unit: RecipeAmountUnit;
  category: RecipeIngredientCategory;
}

interface LegacyIngredientRow {
  id: string;
  name?: string;
  ingredientId?: string;
  amount: string;
  unit?: string;
  category?: string;
}

function createIngredientRow(): IngredientRow {
  return {
    id: crypto.randomUUID(),
    ingredientId: "",
    amount: "",
    unit: "cups",
    category: "other",
  };
}

function migrateIngredients(rows: LegacyIngredientRow[]): IngredientRow[] {
  return rows.map((row) => {
    let ingredientId = row.ingredientId ?? "";

    if (!ingredientId && row.name) {
      const match = INGREDIENTS_LIBRARY.find(
        (item) => item.name.toLowerCase() === row.name!.toLowerCase(),
      );
      ingredientId = match?.id ?? "";
    }

    const item = getIngredientById(ingredientId);

    return {
      id: row.id,
      ingredientId,
      amount: row.amount,
      unit: row.unit
        ? normalizeRecipeUnit(row.unit)
        : item
          ? defaultUnitForIngredient(item)
          : "cups",
      category: row.category
        ? normalizeRecipeCategory(row.category)
        : item
          ? mapLibraryToRecipeCategory(item.category)
          : "other",
    };
  });
}

function formatFactor(factor: number): string {
  const rounded = Math.round(factor * 1000) / 1000;
  return `${rounded}×`;
}

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 1000) / 1000;
  if (Number.isInteger(rounded)) return rounded.toLocaleString();
  return parseFloat(rounded.toFixed(2)).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

interface IngredientEditorProps {
  ingredient: IngredientRow & {
    libraryItem?: ReturnType<typeof getIngredientById>;
    scaled: number | null;
  };
  canRemove: boolean;
  onUpdate: (patch: Partial<IngredientRow>) => void;
  onRemove: () => void;
  onSelectIngredient: (ingredientId: string) => void;
}

function IngredientEditor({
  ingredient,
  canRemove,
  onUpdate,
  onRemove,
  onSelectIngredient,
}: IngredientEditorProps) {
  const { t } = useToolTranslation("recipe-adjuster");
  const meta = RECIPE_CATEGORY_META[ingredient.category];

  return (
    <li className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100 sm:p-5">
      <div className="mb-3 grid gap-3 sm:grid-cols-[112px_1fr_auto] sm:items-end">
        <div>
          <label
            htmlFor={`cat-${ingredient.id}`}
            className="label-caption mb-2 block"
          >
            {t("ingredients.category")}
          </label>
          <select
            id={`cat-${ingredient.id}`}
            className="input-field py-2.5 text-sm"
            value={ingredient.category}
            onChange={(e) =>
              onUpdate({
                category: normalizeRecipeCategory(e.target.value),
              })
            }
          >
            {RECIPE_CATEGORY_ORDER.map((key) => (
              <option key={key} value={key}>
                {t(`categories.${key}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <IngredientCombobox
            value={ingredient.ingredientId}
            onChange={onSelectIngredient}
          />
        </div>

        <button
          type="button"
          className="btn-secondary py-2.5 text-sm"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={t("ingredients.removeAriaLabel")}
        >
          {t("ingredients.remove")}
        </button>
      </div>

      {ingredient.libraryItem && (
        <div className="mb-3 flex items-center gap-2">
          <IngredientIconBadge ingredientId={ingredient.ingredientId} />
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${meta.badge}`}
          >
            {t(`categories.${ingredient.category}`)}
          </span>
          <span className="truncate text-sm font-medium text-slate-700">
            {ingredient.libraryItem.name}
          </span>
        </div>
      )}

      <div className="grid items-end gap-3 sm:grid-cols-[1fr_92px_auto_1fr]">
        <div>
          <label
            htmlFor={`amount-${ingredient.id}`}
            className="label-caption mb-2 block"
          >
            {t("ingredients.originalAmount")}
          </label>
          <input
            id={`amount-${ingredient.id}`}
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            className="input-field py-3 font-mono text-base"
            placeholder={t("ingredients.amountPlaceholder")}
            value={ingredient.amount}
            onChange={(e) => onUpdate({ amount: e.target.value })}
          />
        </div>

        <div>
          <label
            htmlFor={`unit-${ingredient.id}`}
            className="label-caption mb-2 block"
          >
            {t("ingredients.unit")}
          </label>
          <select
            id={`unit-${ingredient.id}`}
            className="input-field py-3 font-mono text-sm"
            value={ingredient.unit}
            onChange={(e) =>
              onUpdate({ unit: normalizeRecipeUnit(e.target.value) })
            }
          >
            {RECIPE_UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(`units.${opt.value}`)}
              </option>
            ))}
          </select>
        </div>

        <span
          className="hidden pb-3 text-xl text-slate-300 sm:block"
          aria-hidden
        >
          →
        </span>

        <div className="rounded-xl bg-violet-50 px-4 py-3 ring-1 ring-violet-200">
          <p className="label-caption mb-1 text-violet-600">{t("ingredients.scaled")}</p>
          <p className="font-mono text-xl font-bold text-violet-800 sm:text-2xl">
            {ingredient.scaled !== null ? formatAmount(ingredient.scaled) : "—"}
          </p>
          {ingredient.scaled !== null && (
            <p className="mt-0.5 text-xs text-violet-600">{ingredient.unit}</p>
          )}
        </div>
      </div>
    </li>
  );
}

interface CompiledGroup {
  category: RecipeIngredientCategory;
  label: string;
  lines: string[];
}

function CompiledScaledRecipe({
  groups,
  targetYield,
  factorLabel,
}: {
  groups: CompiledGroup[];
  targetYield: string;
  factorLabel: string;
}) {
  const { t } = useToolTranslation("recipe-adjuster");
  const [copied, setCopied] = useState(false);

  if (groups.length === 0) return null;

  const copyText = buildCompiledRecipeText(
    groups.map((g) => ({ label: g.label, lines: g.lines })),
    { targetYield, factorLabel },
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — fail silently.
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-700/80 px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
            {t("compiledRecipe.title")}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {t("compiledRecipe.servingsFactor", {
              targetYield,
              factor: factorLabel,
            })}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" aria-hidden />
              {t("compiledRecipe.copied")}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden />
              {t("compiledRecipe.copyFullRecipe")}
            </>
          )}
        </button>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        {groups.map((group) => (
          <div key={group.category}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {group.label}
            </p>
            <ul className="mt-2 space-y-1.5">
              {group.lines.map((line, index) => (
                <li
                  key={`${group.category}-${index}`}
                  className="font-mono text-sm leading-relaxed text-slate-100"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RecipeAdjuster() {
  const { t } = useToolTranslation("recipe-adjuster");
  const [saveName, setSaveName] = useState("");
  const [originalYield, setOriginalYield] = useLocalStorage(
    "tool:recipe-adjuster:original-yield",
    "4",
  );
  const [targetYield, setTargetYield] = useLocalStorage(
    "tool:recipe-adjuster:target-yield",
    "8",
  );
  const [rawIngredients, setIngredients, isHydrated] = useLocalStorage<
    LegacyIngredientRow[]
  >("tool:recipe-adjuster:ingredients", [createIngredientRow()]);

  const ingredients = useMemo(
    () => migrateIngredients(rawIngredients),
    [rawIngredients],
  );

  const handleRestore = useCallback(
    (entry: CalculationHistoryEntry) => {
      setOriginalYield(String(entry.inputs.originalYield ?? "4"));
      setTargetYield(String(entry.inputs.targetYield ?? "8"));
      if (Array.isArray(entry.inputs.ingredients)) {
        setIngredients(entry.inputs.ingredients as LegacyIngredientRow[]);
      }
      setSaveName(entry.name);
    },
    [setOriginalYield, setTargetYield, setIngredients],
  );

  useCalculationRestore("recipe-adjuster", handleRestore);

  const factor = useMemo(() => {
    const original = Number(originalYield);
    const target = Number(targetYield);
    if (
      !Number.isFinite(original) ||
      !Number.isFinite(target) ||
      original <= 0 ||
      target <= 0
    ) {
      return null;
    }
    return target / original;
  }, [originalYield, targetYield]);

  const scaledIngredients = useMemo(() => {
    if (factor === null) return [];
    return ingredients.map((ingredient) => {
      const libraryItem = getIngredientById(ingredient.ingredientId);
      const amount = Number(ingredient.amount);
      const scaled =
        Number.isFinite(amount) && amount >= 0 ? amount * factor : null;
      return { ...ingredient, libraryItem, scaled };
    });
  }, [ingredients, factor]);

  const groupedIngredients = useMemo(() => {
    const map = new Map<RecipeIngredientCategory, typeof scaledIngredients>();

    for (const item of scaledIngredients) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }

    return RECIPE_CATEGORY_ORDER.filter((cat) => map.has(cat)).map(
      (category) => ({
        category,
        meta: RECIPE_CATEGORY_META[category],
        items: map.get(category)!,
      }),
    );
  }, [scaledIngredients]);

  const compiledRecipe = useMemo(() => {
    const valid = scaledIngredients.filter(
      (item) =>
        item.scaled !== null &&
        item.libraryItem &&
        Number.isFinite(Number(item.amount)) &&
        Number(item.amount) > 0,
    );

    if (valid.length === 0) return [];

    const map = new Map<RecipeIngredientCategory, CompiledGroup>();

    for (const item of valid) {
      const line = formatRecipeLine(
        item.libraryItem!.name,
        item.unit,
        item.scaled!,
      );
      const existing = map.get(item.category);
      if (existing) {
        existing.lines.push(line);
      } else {
        map.set(item.category, {
          category: item.category,
          label: t(`categories.${item.category}`),
          lines: [line],
        });
      }
    }

    return RECIPE_CATEGORY_ORDER.filter((cat) => map.has(cat)).map(
      (cat) => map.get(cat)!,
    );
  }, [scaledIngredients, t]);

  const updateIngredient = (id: string, patch: Partial<IngredientRow>) => {
    setIngredients((prev) =>
      migrateIngredients(prev).map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  };

  const selectIngredient = (id: string, ingredientId: string) => {
    const item = getIngredientById(ingredientId);
    const patch: Partial<IngredientRow> = { ingredientId };

    if (item) {
      patch.unit = defaultUnitForIngredient(item);
      patch.category = mapLibraryToRecipeCategory(item.category);
    }

    updateIngredient(id, patch);
  };

  const addIngredient = () => {
    setIngredients((prev) => [...migrateIngredients(prev), createIngredientRow()]);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => {
      const next = migrateIngredients(prev);
      return next.length <= 1 ? next : next.filter((item) => item.id !== id);
    });
  };

  const handleClear = () => {
    setOriginalYield("4");
    setTargetYield("8");
    setIngredients([createIngredientRow()]);
    setSaveName("");
  };

  if (!isHydrated) {
    return <p className="text-sm text-slate-500">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="original-yield" className="label-caption mb-2 block">
            {t("yield.original")}
          </label>
          <input
            id="original-yield"
            type="number"
            min={0.01}
            step="any"
            inputMode="decimal"
            className="input-field py-3.5 text-base shadow-md"
            placeholder={t("yield.originalPlaceholder")}
            value={originalYield}
            onChange={(e) => setOriginalYield(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="target-yield" className="label-caption mb-2 block">
            {t("yield.target")}
          </label>
          <input
            id="target-yield"
            type="number"
            min={0.01}
            step="any"
            inputMode="decimal"
            className="input-field py-3.5 text-base shadow-md"
            placeholder={t("yield.targetPlaceholder")}
            value={targetYield}
            onChange={(e) => setTargetYield(e.target.value)}
          />
        </div>
      </div>

      {factor !== null ? (
        <div className="space-y-4">
          <CalculationSavePanel
            toolSlug="recipe-adjuster"
            saveName={saveName}
            onSaveNameChange={setSaveName}
            inputs={{
              originalYield,
              targetYield,
              ingredients: rawIngredients,
            }}
            resultSummary={t("resultSummary", {
              factor: formatFactor(factor),
              count:
                ingredients.filter(
                  (item) => item.ingredientId && item.amount.trim() !== "",
                ).length || ingredients.length,
            })}
          />

          <div className="rounded-2xl border-2 border-violet-300 bg-violet-50 px-6 py-5 text-center shadow-md">
            <p className="label-caption mb-1 text-violet-600">
              {t("adjustmentFactor.label")}
            </p>
            <p className="text-2xl font-bold text-violet-700 sm:text-3xl">
              {t("adjustmentFactor.scalingBy", { factor: formatFactor(factor) })}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400">
          {t("emptyState.invalidYields")}
        </p>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <p className="label-caption">{t("ingredients.sectionTitle")}</p>
          <button type="button" className="btn-secondary py-2.5" onClick={addIngredient}>
            {t("ingredients.addIngredient")}
          </button>
        </div>

        {groupedIngredients.map(({ category, meta, items }) => (
          <section key={category}>
            <div
              className={`mb-3 flex items-center gap-2 border-b pb-2 ${meta.header}`}
            >
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${meta.badge}`}
              >
                {t(`categories.${category}`)}
              </span>
              <span className="text-xs text-slate-400">
                {items.length}{" "}
                {t("ingredients.item", { count: items.length })}
              </span>
            </div>

            <ul className="space-y-3">
              {items.map((ingredient) => (
                <IngredientEditor
                  key={ingredient.id}
                  ingredient={ingredient}
                  canRemove={ingredients.length > 1}
                  onUpdate={(patch) => updateIngredient(ingredient.id, patch)}
                  onRemove={() => removeIngredient(ingredient.id)}
                  onSelectIngredient={(ingredientId) =>
                    selectIngredient(ingredient.id, ingredientId)
                  }
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {factor !== null && compiledRecipe.length > 0 && (
        <CompiledScaledRecipe
          groups={compiledRecipe}
          targetYield={targetYield}
          factorLabel={formatFactor(factor)}
        />
      )}

      <div className="flex justify-end">
        <button type="button" className="btn-secondary" onClick={handleClear}>
          {t("actions.reset")}
        </button>
      </div>
    </div>
  );
}
