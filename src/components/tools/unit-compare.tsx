"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CheckCircle2,
  PiggyBank,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { CalculationSavePanel } from "@/components/tools/calculation-save-panel";
import { useCalculationRestore } from "@/hooks/use-calculation-restore";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";

export type PromotionType = "none" | "percent" | "dollar" | "bogo";

export interface CompareItem {
  id: string;
  name: string;
  price: string;
  quantity: string;
  promotionType: PromotionType;
  promotionValue: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  shelfPrice: number;
  effectivePrice: number;
  quantity: number;
  unitPrice: number;
  promotionType: PromotionType;
  promotionValue: number;
  sessionMaxUnitPrice: number;
  unitLabel: string;
  addedAt: number;
}

interface ParsedCompareItem {
  id: string;
  name: string;
  shelfPrice: number;
  shelfQuantity: number;
  effectivePrice: number;
  effectiveQuantity: number;
  unitPrice: number;
  promotionType: PromotionType;
  promotionValue: number;
  hasPromotion: boolean;
}

const PROMOTION_OPTIONS: { value: PromotionType; label: string }[] = [
  { value: "none", label: "No promotion" },
  { value: "percent", label: "% off" },
  { value: "dollar", label: "$ off" },
  { value: "bogo", label: "Buy 1 Get 1" },
];

function createCompareItem(partial?: Partial<CompareItem>): CompareItem {
  return {
    id: crypto.randomUUID(),
    name: partial?.name ?? "",
    price: partial?.price ?? "",
    quantity: partial?.quantity ?? "",
    promotionType: partial?.promotionType ?? "none",
    promotionValue: partial?.promotionValue ?? "",
  };
}

function createDefaultItems(): CompareItem[] {
  return [createCompareItem({ name: "Brand A" }), createCompareItem({ name: "Brand B" })];
}

function normalizeCompareItem(raw: CompareItem): CompareItem {
  return {
    ...raw,
    promotionType: raw.promotionType ?? "none",
    promotionValue: raw.promotionValue ?? "",
  };
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parsePositive(value: string): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseNonNegative(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function computeEffectivePricing(
  shelfPrice: number,
  shelfQuantity: number,
  promotionType: PromotionType,
  promotionValue: number,
): {
  effectivePrice: number;
  effectiveQuantity: number;
  unitPrice: number;
  hasPromotion: boolean;
} {
  let effectivePrice = shelfPrice;
  let effectiveQuantity = shelfQuantity;

  switch (promotionType) {
    case "percent":
      effectivePrice =
        shelfPrice * (1 - Math.min(100, Math.max(0, promotionValue)) / 100);
      break;
    case "dollar":
      effectivePrice = Math.max(0, shelfPrice - promotionValue);
      break;
    case "bogo":
      effectiveQuantity = shelfQuantity * 2;
      break;
    default:
      break;
  }

  const unitPrice = effectivePrice / effectiveQuantity;
  return {
    effectivePrice,
    effectiveQuantity,
    unitPrice,
    hasPromotion: promotionType !== "none",
  };
}

function parseCompareItem(item: CompareItem): ParsedCompareItem | null {
  const shelfPrice = parsePositive(item.price);
  const shelfQuantity = parsePositive(item.quantity);
  if (shelfPrice === null || shelfQuantity === null) return null;

  const promotionType = item.promotionType ?? "none";
  const promotionValue =
    promotionType === "bogo" ? 0 : parseNonNegative(item.promotionValue);

  const pricing = computeEffectivePricing(
    shelfPrice,
    shelfQuantity,
    promotionType,
    promotionValue,
  );

  return {
    id: item.id,
    name: item.name,
    shelfPrice,
    shelfQuantity,
    effectivePrice: pricing.effectivePrice,
    effectiveQuantity: pricing.effectiveQuantity,
    unitPrice: pricing.unitPrice,
    promotionType,
    promotionValue,
    hasPromotion: pricing.hasPromotion,
  };
}

function itemPotentialSavings(
  unitPrice: number,
  quantity: number,
  sessionMaxUnitPrice: number,
): number {
  return Math.max(0, sessionMaxUnitPrice - unitPrice) * quantity;
}

function promotionLabel(type: PromotionType, value: number): string | null {
  switch (type) {
    case "percent":
      return value > 0 ? `${value}% off` : null;
    case "dollar":
      return value > 0 ? `${formatCurrency(value)} off` : null;
    case "bogo":
      return "Buy 1 Get 1";
    default:
      return null;
  }
}

function migrateLegacyInputs(entry: CalculationHistoryEntry): CompareItem[] | null {
  const { price1, quantity1, price2, quantity2 } = entry.inputs;
  if (price1 === undefined && price2 === undefined) return null;

  const items: CompareItem[] = [];
  if (price1 !== undefined || quantity1 !== undefined) {
    items.push(
      createCompareItem({
        name: "Option A",
        price: String(price1 ?? ""),
        quantity: String(quantity1 ?? ""),
      }),
    );
  }
  if (price2 !== undefined || quantity2 !== undefined) {
    items.push(
      createCompareItem({
        name: "Option B",
        price: String(price2 ?? ""),
        quantity: String(quantity2 ?? ""),
      }),
    );
  }
  return items.length > 0 ? items : null;
}

function CartSummaryCard({
  itemCount,
  cartTotal,
  totalSavings,
}: {
  itemCount: number;
  cartTotal: number;
  totalSavings: number;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-md sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
          Your Cart
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
            Items in cart
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">{itemCount}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
            Cart total
          </p>
          <p className="mt-1 font-mono text-2xl font-bold">
            {formatCurrency(cartTotal)}
          </p>
        </div>
        <div className="rounded-xl bg-white/15 px-4 py-3 ring-1 ring-white/20">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">
              Total savings
            </p>
          </div>
          <p className="mt-1 font-mono text-2xl font-bold text-amber-300">
            {formatCurrency(totalSavings)}
          </p>
        </div>
      </div>
      {itemCount === 0 && (
        <p className="mt-4 text-sm text-blue-100/80">
          Add products from your comparison to start tracking savings.
        </p>
      )}
    </div>
  );
}

export function UnitCompare() {
  const [items, setItems, isHydrated] = useLocalStorage<CompareItem[]>(
    "tool:unit-compare:items",
    createDefaultItems(),
  );
  const [unitLabel, setUnitLabel] = useLocalStorage(
    "tool:unit-compare:unit-label",
    "unit",
  );
  const [shoppingList, setShoppingList] = useLocalStorage<ShoppingListItem[]>(
    "tool:unit-compare:shopping-list",
    [],
  );
  const [saveName, setSaveName] = useState("");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const normalizedItems = useMemo(
    () => items.map(normalizeCompareItem),
    [items],
  );

  const analysis = useMemo(() => {
    const parsed = normalizedItems
      .map(parseCompareItem)
      .filter((item): item is ParsedCompareItem => item !== null);

    if (parsed.length < 2) return null;

    const sorted = [...parsed].sort((a, b) => a.unitPrice - b.unitPrice);
    const bestUnitPrice = sorted[0].unitPrice;
    const bestValueIds = new Set(
      sorted.filter((item) => item.unitPrice === bestUnitPrice).map((item) => item.id),
    );
    const worstUnitPrice = sorted[sorted.length - 1].unitPrice;
    const savingsPerUnit = worstUnitPrice - bestUnitPrice;
    const savingsPercent =
      worstUnitPrice > 0 ? (savingsPerUnit / worstUnitPrice) * 100 : 0;

    return {
      parsed: sorted,
      bestValueIds,
      bestItem: sorted[0],
      worstUnitPrice,
      savingsPerUnit,
      savingsPercent,
    };
  }, [normalizedItems]);

  const cartStats = useMemo(() => {
    const itemCount = shoppingList.length;
    const cartTotal = shoppingList.reduce(
      (sum, item) => sum + item.effectivePrice,
      0,
    );
    const totalSavings = shoppingList.reduce(
      (sum, item) =>
        sum +
        itemPotentialSavings(
          item.unitPrice,
          item.quantity,
          item.sessionMaxUnitPrice,
        ),
      0,
    );
    return { itemCount, cartTotal, totalSavings };
  }, [shoppingList]);

  const handleRestore = useCallback(
    (entry: CalculationHistoryEntry) => {
      if (Array.isArray(entry.inputs.items)) {
        setItems(
          (entry.inputs.items as CompareItem[]).map(normalizeCompareItem),
        );
      } else {
        const migrated = migrateLegacyInputs(entry);
        if (migrated) setItems(migrated);
      }
      if (entry.inputs.unitLabel !== undefined) {
        setUnitLabel(String(entry.inputs.unitLabel));
      }
      setSaveName(entry.name);
    },
    [setItems, setUnitLabel],
  );

  useCalculationRestore("unit-compare", handleRestore);

  const updateItem = (id: string, patch: Partial<CompareItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      createCompareItem({ name: `Brand ${String.fromCharCode(65 + prev.length)}` }),
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length <= 2 ? prev : prev.filter((item) => item.id !== id)));
  };

  const handleClear = () => {
    setItems(createDefaultItems());
    setSaveName("");
  };

  const addToShoppingList = (parsed: ParsedCompareItem) => {
    if (!analysis) return;

    setShoppingList((prev) => [
      {
        id: crypto.randomUUID(),
        name: parsed.name.trim() || "Unnamed item",
        shelfPrice: parsed.shelfPrice,
        effectivePrice: parsed.effectivePrice,
        quantity: parsed.shelfQuantity,
        unitPrice: parsed.unitPrice,
        promotionType: parsed.promotionType,
        promotionValue: parsed.promotionValue,
        sessionMaxUnitPrice: analysis.worstUnitPrice,
        unitLabel: unitLabel.trim() || "unit",
        addedAt: Date.now(),
      },
      ...prev,
    ]);
    setJustAddedId(parsed.id);
    window.setTimeout(() => setJustAddedId(null), 1500);
  };

  const removeFromShoppingList = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearShoppingList = () => setShoppingList([]);

  const hasInput = normalizedItems.some(
    (item) => item.name !== "" || item.price !== "" || item.quantity !== "",
  );

  if (!isHydrated) {
    return <p className="text-sm text-slate-500">Loading shopping assistant…</p>;
  }

  const unitSuffix = unitLabel.trim() ? ` / ${unitLabel.trim()}` : " / unit";

  return (
    <div className="space-y-6">
      <CartSummaryCard
        itemCount={cartStats.itemCount}
        cartTotal={cartStats.cartTotal}
        totalSavings={cartStats.totalSavings}
      />

      <section className="space-y-6">
        <div className="rounded-2xl bg-white p-5 shadow-md">
          <p className="label-caption mb-4 text-blue-500">Compare Setup</p>
          <div>
            <label htmlFor="unit-label" className="label-caption mb-2 block">
              Unit type (same for all items)
            </label>
            <input
              id="unit-label"
              type="text"
              className="input-field max-w-xs py-3 text-base"
              placeholder="e.g. oz, g, ml, each"
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Enter quantities in the same unit so prices compare fairly.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="label-caption">Products to Compare</p>
            <button type="button" className="btn-secondary py-2.5" onClick={addItem}>
              + Add Product
            </button>
          </div>

          <ul className="space-y-3">
            {normalizedItems.map((item) => {
              const parsed = parseCompareItem(item);
              const isBest =
                parsed !== null &&
                analysis !== null &&
                analysis.bestValueIds.has(item.id);

              return (
                <li
                  key={item.id}
                  className={`rounded-2xl bg-white p-4 shadow-md transition-all duration-200 sm:p-5 ${
                    isBest
                      ? "ring-2 ring-emerald-400 ring-offset-2"
                      : "ring-1 ring-slate-100"
                  }`}
                >
                  {isBest && (
                    <div className="mb-3 flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                      <span className="text-sm font-semibold">Best Value</span>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-[1fr_110px_110px_auto] sm:items-end">
                    <div>
                      <label
                        htmlFor={`name-${item.id}`}
                        className="label-caption mb-2 block"
                      >
                        Product name
                      </label>
                      <input
                        id={`name-${item.id}`}
                        type="text"
                        className="input-field py-3 text-base"
                        placeholder="Brand or label"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`price-${item.id}`}
                        className="label-caption mb-2 block"
                      >
                        Price
                      </label>
                      <input
                        id={`price-${item.id}`}
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        className="input-field py-3 font-mono text-base"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, { price: e.target.value })}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`qty-${item.id}`}
                        className="label-caption mb-2 block"
                      >
                        Quantity
                      </label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        className="input-field py-3 font-mono text-base"
                        placeholder="Amount"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, { quantity: e.target.value })
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-secondary py-3"
                      onClick={() => removeItem(item.id)}
                      disabled={normalizedItems.length <= 2}
                      aria-label={`Remove ${item.name || "product"}`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr] sm:items-end">
                    <div>
                      <label
                        htmlFor={`promo-type-${item.id}`}
                        className="label-caption mb-2 block"
                      >
                        Promotion
                      </label>
                      <select
                        id={`promo-type-${item.id}`}
                        className="input-field py-3 text-base"
                        value={item.promotionType}
                        onChange={(e) =>
                          updateItem(item.id, {
                            promotionType: e.target.value as PromotionType,
                            promotionValue:
                              e.target.value === "bogo" ? "" : item.promotionValue,
                          })
                        }
                      >
                        {PROMOTION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {(item.promotionType === "percent" ||
                      item.promotionType === "dollar") && (
                      <div>
                        <label
                          htmlFor={`promo-val-${item.id}`}
                          className="label-caption mb-2 block"
                        >
                          {item.promotionType === "percent"
                            ? "Discount %"
                            : "Discount amount"}
                        </label>
                        <input
                          id={`promo-val-${item.id}`}
                          type="number"
                          min={0}
                          step={item.promotionType === "percent" ? "1" : "0.01"}
                          inputMode="decimal"
                          className="input-field max-w-xs py-3 font-mono text-base"
                          placeholder={item.promotionType === "percent" ? "20" : "1.00"}
                          value={item.promotionValue}
                          onChange={(e) =>
                            updateItem(item.id, { promotionValue: e.target.value })
                          }
                        />
                      </div>
                    )}

                    {item.promotionType === "bogo" && (
                      <p className="text-sm text-slate-500 sm:pb-3">
                        Pay for one, get double the quantity — unit price halved.
                      </p>
                    )}
                  </div>

                  {parsed && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="text-sm text-slate-500">
                        {parsed.hasPromotion ? (
                          <>
                            <span className="font-mono text-slate-400 line-through">
                              {formatCurrency(parsed.shelfPrice / parsed.shelfQuantity)}
                            </span>
                            <span className="mx-2 text-slate-300">→</span>
                          </>
                        ) : null}
                        <span className="font-mono font-semibold text-slate-800">
                          {formatCurrency(parsed.unitPrice)}
                        </span>
                        {unitSuffix}
                        {promotionLabel(parsed.promotionType, parsed.promotionValue) && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            {promotionLabel(parsed.promotionType, parsed.promotionValue)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn-primary inline-flex items-center gap-2 py-2.5"
                        disabled={!analysis}
                        onClick={() => addToShoppingList(parsed)}
                      >
                        <ShoppingCart className="h-4 w-4" aria-hidden />
                        {justAddedId === item.id ? "Added!" : "Add to Shopping List"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasInput && (
            <button type="button" className="btn-secondary" onClick={handleClear}>
              Reset Comparison
            </button>
          )}
        </div>

        {analysis ? (
          <div className="space-y-4">
            <CalculationSavePanel
              toolSlug="unit-compare"
              toolName="Smart Shopping Assistant"
              saveName={saveName}
              onSaveNameChange={setSaveName}
              inputs={{ items: normalizedItems, unitLabel }}
              resultSummary={`${analysis.bestItem.name || "Best pick"} — ${formatCurrency(analysis.bestItem.unitPrice)}${unitSuffix}`}
            />

            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-6 py-8 text-center shadow-md">
              <div className="mb-2 flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
                <p className="label-caption text-emerald-600">Best Value</p>
              </div>
              <p className="text-2xl font-bold text-emerald-800 sm:text-3xl">
                {analysis.bestItem.name.trim() || "Top pick"}
              </p>
              <p className="mt-2 font-mono text-lg text-emerald-700">
                {formatCurrency(analysis.bestItem.unitPrice)}
                {unitLabel.trim() ? ` per ${unitLabel.trim()}` : " per unit"}
              </p>
              {analysis.savingsPerUnit > 0 && (
                <p className="mt-3 text-sm text-emerald-700/80">
                  Save up to{" "}
                  <span className="font-mono font-semibold">
                    {formatCurrency(analysis.savingsPerUnit)}
                  </span>{" "}
                  per {unitLabel.trim() || "unit"} vs the most expensive option (
                  {analysis.savingsPercent.toFixed(1)}%)
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white px-5 py-4 shadow-md">
              <p className="label-caption mb-3">Price Ranking</p>
              <ul className="space-y-2">
                {analysis.parsed.map((item, index) => (
                  <li
                    key={item.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${
                      analysis.bestValueIds.has(item.id)
                        ? "bg-emerald-50 ring-1 ring-emerald-200"
                        : "bg-slate-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {analysis.bestValueIds.has(item.id) ? (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-emerald-600"
                          aria-hidden
                        />
                      ) : (
                        <span className="w-4 shrink-0 text-center text-xs text-slate-400">
                          {index + 1}
                        </span>
                      )}
                      <span className="truncate font-medium text-slate-800">
                        {item.name.trim() || `Product ${index + 1}`}
                      </span>
                      {item.hasPromotion && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                          promo
                        </span>
                      )}
                    </div>
                    <span className="ml-2 shrink-0 font-mono text-slate-600">
                      {formatCurrency(item.unitPrice)}
                      {unitLabel.trim() ? `/${unitLabel.trim()}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">
            Add at least two products with price and quantity to compare.
          </p>
        )}
      </section>

      <section className="space-y-4 border-t-2 border-dashed border-slate-200 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
              <ShoppingCart className="h-5 w-5 text-blue-600" aria-hidden />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">Shopping List</p>
              <p className="text-xs text-slate-500">
                Saved locally — persists across refresh
              </p>
            </div>
          </div>
          {shoppingList.length > 0 && (
            <button
              type="button"
              className="btn-secondary py-2 text-sm"
              onClick={clearShoppingList}
            >
              Clear all
            </button>
          )}
        </div>

        {shoppingList.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
            <PiggyBank className="mx-auto mb-3 h-8 w-8 text-slate-300" aria-hidden />
            <p className="text-sm text-slate-500">
              Your list is empty. Pick a winner from the comparison and tap{" "}
              <strong>Add to Shopping List</strong>.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {shoppingList.map((item) => {
              const savings = itemPotentialSavings(
                item.unitPrice,
                item.quantity,
                item.sessionMaxUnitPrice,
              );
              const promo = promotionLabel(item.promotionType, item.promotionValue);

              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-md ring-1 ring-slate-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.effectivePrice < item.shelfPrice ? (
                        <>
                          <span className="font-mono line-through">
                            {formatCurrency(item.shelfPrice)}
                          </span>
                          <span className="mx-1.5 font-mono font-medium text-slate-800">
                            {formatCurrency(item.effectivePrice)}
                          </span>
                        </>
                      ) : (
                        <span className="font-mono">{formatCurrency(item.effectivePrice)}</span>
                      )}
                      · {item.quantity} {item.unitLabel}
                      {promo && (
                        <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          {promo}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatCurrency(item.unitPrice)}/{item.unitLabel}
                      {savings > 0 && (
                        <span className="ml-2 font-medium text-amber-600">
                          · Saved {formatCurrency(savings)} vs priciest option
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary shrink-0 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    onClick={() => removeFromShoppingList(item.id)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
