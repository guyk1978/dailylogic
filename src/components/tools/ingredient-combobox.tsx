"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  getGroupedIngredientOptions,
  getIngredientById,
  getUnitForIngredient,
  type IngredientLibraryItem,
} from "@/lib/ingredients-data";
import { IngredientIcon } from "@/components/tools/ingredient-icon";

interface IngredientComboboxProps {
  value: string;
  onChange: (ingredientId: string) => void;
}

export function IngredientCombobox({ value, onChange }: IngredientComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = getIngredientById(value);

  const groupedOptions = useMemo(
    () => getGroupedIngredientOptions(query),
    [query],
  );

  const hasOptions = groupedOptions.some((group) => group.items.length > 0);

  useEffect(() => {
    if (selected) {
      setQuery(selected.name);
    }
  }, [selected]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        if (selected) setQuery(selected.name);
        else setQuery("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [selected]);

  const handleSelect = (ingredient: IngredientLibraryItem) => {
    onChange(ingredient.id);
    setQuery(ingredient.name);
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
        Ingredient
      </label>
      <div className="relative">
        {selected && !open ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <IngredientIcon name={selected.icon} className="h-3.5 w-3.5" />
          </span>
        ) : (
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
          placeholder="Search 200+ ingredients…"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className="input-field py-3.5 pl-10 pr-10 text-base shadow-md"
        />
        <ChevronDown
          className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl bg-white py-2 shadow-md ring-1 ring-slate-100"
        >
          {!hasOptions ? (
            <p className="px-4 py-3 text-sm text-slate-500">
              No ingredients found — try another search
            </p>
          ) : (
            groupedOptions.map((group, groupIndex) => (
              <div key={group.category} role="group" aria-label={group.category}>
                <p
                  className={`sticky top-0 bg-white/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 backdrop-blur-sm ${
                    groupIndex > 0 ? "border-t border-slate-100" : ""
                  }`}
                >
                  {group.category}
                </p>
                <ul>
                  {group.items.map((ingredient) => {
                    const isSelected = ingredient.id === value;

                    return (
                      <li
                        key={ingredient.id}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <button
                          type="button"
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition duration-200 hover:bg-violet-50 ${
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
                            {ingredient.name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {selected && !open && (
        <p className="mt-2 text-xs text-slate-500">
          {selected.category} · {getUnitForIngredient(selected)}
        </p>
      )}
    </div>
  );
}

export function IngredientIconBadge({
  ingredientId,
  size = "md",
}: {
  ingredientId: string;
  size?: "sm" | "md";
}) {
  const ingredient = getIngredientById(ingredientId);
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
