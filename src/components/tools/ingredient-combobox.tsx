"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import {
  getGroupedIngredientOptions,
  getUnitForIngredient,
  type IngredientLibraryItem,
} from "@/lib/ingredients-data";
import {
  findIngredientByExactName,
  resolveIngredient,
} from "@/lib/custom-ingredients";
import { IngredientIcon } from "@/components/tools/ingredient-icon";
import { useIngredientLabels } from "@/hooks/use-ingredient-labels";
import { useToolTranslation } from "@/hooks/use-tool-translation";

interface IngredientComboboxProps {
  value: string;
  onChange: (ingredientId: string) => void;
  extras?: IngredientLibraryItem[];
  onCreate?: (name: string) => IngredientLibraryItem | undefined;
}

export function IngredientCombobox({
  value,
  onChange,
  extras = [],
  onCreate,
}: IngredientComboboxProps) {
  const { t } = useToolTranslation("recipe-adjuster");
  const { getName, getCategoryLabel, searchLabels, nameById } =
    useIngredientLabels(extras);
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = resolveIngredient(value, extras);

  const groupedOptions = useMemo(
    () => getGroupedIngredientOptions(query, searchLabels, extras),
    [query, searchLabels, extras],
  );

  const trimmedQuery = query.trim();
  const exactMatch = useMemo(
    () =>
      trimmedQuery
        ? findIngredientByExactName(trimmedQuery, extras, nameById)
        : undefined,
    [trimmedQuery, extras, nameById],
  );
  const canCreate =
    Boolean(onCreate) && trimmedQuery.length > 0 && !exactMatch;

  const hasOptions =
    groupedOptions.some((group) => group.items.length > 0) || canCreate;

  useEffect(() => {
    if (selected) {
      setQuery(getName(selected.id, selected.name));
    }
  }, [selected, getName]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        if (selected) setQuery(getName(selected.id, selected.name));
        else setQuery("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [selected, getName]);

  const handleSelect = (ingredient: IngredientLibraryItem) => {
    onChange(ingredient.id);
    setQuery(getName(ingredient.id, ingredient.name));
    setOpen(false);
  };

  const handleCreate = () => {
    if (!onCreate || !trimmedQuery) return;
    const created = onCreate(trimmedQuery);
    if (!created) return;
    onChange(created.id);
    setQuery(created.name);
    setOpen(false);
  };

  const handleInputChange = (next: string) => {
    setQuery(next);
    setOpen(true);
    if (!next.trim()) onChange("");
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={`${listboxId}-input`} className="label-caption mb-2 block">
        {t("combobox.label")}
      </label>
      <div className="relative">
        {selected && !open ? (
          <span className="pointer-events-none absolute start-3.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <IngredientIcon name={selected.icon} className="h-3.5 w-3.5" />
          </span>
        ) : (
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
        )}
        <input
          id={`${listboxId}-input`}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          placeholder={t("combobox.placeholder")}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canCreate) {
              e.preventDefault();
              handleCreate();
            }
          }}
          className="input-field py-3.5 ps-10 pe-10 text-base shadow-md"
        />
        <ChevronDown
          className={`pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl bg-white p-2 shadow-md ring-1 ring-slate-100"
        >
          {canCreate && (
            <button
              type="button"
              role="option"
              aria-selected={false}
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-start transition duration-200 hover:bg-violet-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreate}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Plus className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  {t("combobox.addCustom", { name: trimmedQuery })}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {t("combobox.addCustomHint")}
                </span>
              </span>
            </button>
          )}

          {!hasOptions ? (
            <p className="px-4 py-3 text-sm text-slate-500">
              {t("combobox.noResults")}
            </p>
          ) : (
            groupedOptions.map((group, groupIndex) => {
              const categoryLabel = getCategoryLabel(group.category);
              return (
                <div
                  key={group.category}
                  role="group"
                  aria-label={categoryLabel}
                >
                  <p
                    className={`sticky top-0 bg-white/95 px-4 py-2 text-[11px] font-semibold tracking-wide text-slate-400 backdrop-blur-sm uppercase rtl:normal-case rtl:tracking-normal ${
                      groupIndex > 0 || canCreate
                        ? "border-t border-slate-100"
                        : ""
                    }`}
                  >
                    {categoryLabel}
                  </p>
                  <ul>
                    {group.items.map((ingredient) => {
                      const isSelected = ingredient.id === value;
                      const label = getName(ingredient.id, ingredient.name);
                      return (
                        <li
                          key={ingredient.id}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <button
                            type="button"
                            className={`flex w-full items-center gap-3 px-4 py-3 text-start transition duration-200 hover:bg-violet-50 ${
                              isSelected ? "bg-violet-50" : ""
                            }`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(ingredient)}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                              <IngredientIcon
                                name={ingredient.icon}
                                className="h-4 w-4"
                              />
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                              {label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      )}

      {selected && !open && (
        <p className="mt-2 text-xs text-slate-500">
          {t("combobox.selectedMeta", {
            category: getCategoryLabel(selected.category),
            unit: t(`units.${getUnitForIngredient(selected)}`),
          })}
        </p>
      )}
    </div>
  );
}

export function IngredientIconBadge({
  ingredientId,
  extras = [],
  size = "md",
}: {
  ingredientId: string;
  extras?: IngredientLibraryItem[];
  size?: "sm" | "md";
}) {
  const ingredient = resolveIngredient(ingredientId, extras);
  if (!ingredient) return null;

  const sizeClasses =
    size === "sm" ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl";

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-violet-100 text-violet-600 ${sizeClasses}`}
      aria-hidden
    >
      <IngredientIcon
        name={ingredient.icon}
        className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
      />
    </span>
  );
}
