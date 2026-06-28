"use client";

import { useCallback, useMemo, useState } from "react";
import { CalculationSavePanel } from "@/components/tools/calculation-save-panel";
import { useCalculationRestore } from "@/hooks/use-calculation-restore";
import { useToolTranslation } from "@/hooks/use-tool-translation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";

export type ExpensePriority = "essential" | "flexible" | "luxury";

export interface ExpenseCategory {
  id: string;
  name: string;
  amount: string;
  priority: ExpensePriority;
  starterKey?: string;
}

type ExpenseAdjustments = Record<string, number>;

const PRIORITY_STYLES: Record<
  ExpensePriority,
  { color: string; bar: string }
> = {
  essential: { color: "text-blue-600", bar: "bg-blue-500" },
  flexible: { color: "text-amber-600", bar: "bg-amber-500" },
  luxury: { color: "text-rose-600", bar: "bg-rose-500" },
};

const STARTER_CATEGORIES: { starterKey: string; priority: ExpensePriority }[] = [
  { starterKey: "housing", priority: "essential" },
  { starterKey: "food", priority: "essential" },
  { starterKey: "transport", priority: "essential" },
  { starterKey: "children", priority: "essential" },
  { starterKey: "pets", priority: "flexible" },
  { starterKey: "entertainment", priority: "luxury" },
];

function createExpense(
  partial: Partial<ExpenseCategory> & { priority: ExpensePriority },
): ExpenseCategory {
  return {
    id: crypto.randomUUID(),
    name: partial.name ?? "",
    amount: "",
    ...partial,
  };
}

function createDefaultExpenses(): ExpenseCategory[] {
  return STARTER_CATEGORIES.map((cat) =>
    createExpense({ starterKey: cat.starterKey, priority: cat.priority }),
  );
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseAmount(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function getCategoryDisplayName(
  item: ExpenseCategory,
  translate: (key: string) => string,
): string {
  if (item.starterKey) {
    return translate(`starterCategories.${item.starterKey}`);
  }
  return item.name;
}

type BudgetPlanResult = {
  income: number;
  savings: number;
  buffer: number;
  totals: Record<ExpensePriority, number>;
  totalExpenses: number;
  totalRequired: number;
  surplus: number;
  gap: number;
  parsed: { id: string; name: string; parsedAmount: number; priority: ExpensePriority }[];
  reducible: {
    id: string;
    name: string;
    priority: ExpensePriority;
    parsedAmount: number;
  }[];
};

type AdjustedExpense = BudgetPlanResult["parsed"][number] & {
  adjustedAmount: number;
};

type DisplayPlan = Omit<BudgetPlanResult, "parsed" | "reducible"> & {
  parsed: AdjustedExpense[];
};

function buildDisplayPlan(
  result: BudgetPlanResult,
  adjustments: ExpenseAdjustments,
): DisplayPlan {
  const parsed: AdjustedExpense[] = result.parsed.map((item) => {
    const reduction = adjustments[item.id] ?? 0;
    const adjustedAmount = item.parsedAmount * (1 - reduction / 100);
    return { ...item, adjustedAmount };
  });

  const totals: Record<ExpensePriority, number> = {
    essential: 0,
    flexible: 0,
    luxury: 0,
  };

  for (const item of parsed) {
    totals[item.priority] += item.adjustedAmount;
  }

  const totalExpenses =
    totals.essential + totals.flexible + totals.luxury;
  const totalRequired = totalExpenses + result.savings + result.buffer;
  const surplus = result.income - totalRequired;
  const gap = surplus < 0 ? Math.abs(surplus) : 0;

  return {
    income: result.income,
    savings: result.savings,
    buffer: result.buffer,
    totals,
    totalExpenses,
    totalRequired,
    surplus,
    gap,
    parsed,
  };
}

function DecisionBoard({
  expenses,
  totals,
}: {
  expenses: AdjustedExpense[];
  totals: Record<ExpensePriority, number>;
}) {
  const { t } = useToolTranslation("budget-simple");

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {(["essential", "flexible", "luxury"] as ExpensePriority[]).map((priority) => {
        const items = expenses.filter((item) => item.priority === priority);
        const styles = PRIORITY_STYLES[priority];

        return (
          <div
            key={priority}
            className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-100"
          >
            <div className="mb-4">
              <p className={`text-sm font-semibold ${styles.color}`}>
                {t(`priorities.${priority}.label`)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {t(`priorities.${priority}.description`)}
              </p>
              <p className="mt-2 font-mono text-xl font-bold text-slate-900">
                {formatCurrency(totals[priority])}
              </p>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400">{t("decisionBoard.empty")}</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="truncate text-slate-700">{item.name}</span>
                    <span className="ml-2 shrink-0 text-right font-mono text-sm">
                      {item.adjustedAmount < item.parsedAmount ? (
                        <>
                          <span className="text-slate-400 line-through">
                            {formatCurrency(item.parsedAmount)}
                          </span>
                          <span className="ml-1 font-semibold text-emerald-700">
                            {formatCurrency(item.adjustedAmount)}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-600">
                          {formatCurrency(item.adjustedAmount)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {priority === "essential" && (
              <p className="mt-3 text-xs text-slate-400">
                {t("decisionBoard.essentialsLocked")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CloseTheGapSection({
  reducible,
  gap,
  adjustments,
  onAdjust,
}: {
  reducible: {
    id: string;
    name: string;
    priority: ExpensePriority;
    parsedAmount: number;
  }[];
  gap: number;
  adjustments: ExpenseAdjustments;
  onAdjust: (id: string, reductionPercent: number) => void;
}) {
  const { t } = useToolTranslation("budget-simple");

  const { totalCuts, gapClosed, gapRemaining, coveredPercent } = useMemo(() => {
    let cuts = 0;
    for (const item of reducible) {
      const reduction = adjustments[item.id] ?? 0;
      cuts += item.parsedAmount * (reduction / 100);
    }
    const closed = Math.min(gap, cuts);
    return {
      totalCuts: cuts,
      gapClosed: closed,
      gapRemaining: Math.max(0, gap - cuts),
      coveredPercent: gap > 0 ? Math.min(100, (closed / gap) * 100) : 100,
    };
  }, [reducible, adjustments, gap]);

  if (reducible.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-md">
        <p className="label-caption mb-2 text-rose-600">{t("closeGap.caption")}</p>
        <p className="text-sm text-rose-800">{t("closeGap.noCategories")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-md sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-caption text-amber-700">{t("closeGap.caption")}</p>
          <p className="mt-1 text-sm text-slate-600">{t("closeGap.description")}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {t("closeGap.gapCovered")}
          </p>
          <p className="font-mono text-lg font-bold text-emerald-600">
            {formatCurrency(gapClosed)} / {formatCurrency(gap)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>
            {t("closeGap.percentAddressed", {
              percent: coveredPercent.toFixed(0),
            })}
          </span>
          <span>
            {t("closeGap.remaining", { amount: formatCurrency(gapRemaining) })}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-200"
            style={{ width: `${coveredPercent}%` }}
          />
        </div>
      </div>

      <ul className="space-y-4">
        {reducible.map((item) => {
          const reduction = adjustments[item.id] ?? 0;
          const cut = item.parsedAmount * (reduction / 100);
          const adjusted = item.parsedAmount - cut;

          return (
            <li
              key={item.id}
              className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className={`text-xs ${PRIORITY_STYLES[item.priority].color}`}>
                    {t(`priorities.${item.priority}.label`)}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-mono text-slate-500 line-through">
                    {formatCurrency(item.parsedAmount)}
                  </p>
                  <p className="font-mono font-semibold text-emerald-700">
                    → {formatCurrency(adjusted)}
                  </p>
                </div>
              </div>

              <label
                htmlFor={`adjust-${item.id}`}
                className="label-caption mb-2 block"
              >
                {t("closeGap.adjustReduction", { percent: reduction })}
              </label>
              <input
                id={`adjust-${item.id}`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={reduction}
                onChange={(e) => onAdjust(item.id, Number(e.target.value))}
                className="h-3 w-full cursor-pointer accent-amber-500"
              />
              <p className="mt-2 text-xs text-slate-500">
                {t("closeGap.freesUp", { amount: formatCurrency(cut) })}
              </p>
            </li>
          );
        })}
      </ul>

      {gapRemaining <= 0 && totalCuts > 0 && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {t("closeGap.fullyCovered")}
        </p>
      )}
    </div>
  );
}

export function BudgetPlanner() {
  const { t, tc } = useToolTranslation("budget-simple");
  const [monthlyIncome, setMonthlyIncome] = useLocalStorage(
    "tool:budget-planner:income",
    "",
  );
  const [goalSavings, setGoalSavings] = useLocalStorage(
    "tool:budget-planner:goal-savings",
    "",
  );
  const [safetyBuffer, setSafetyBuffer] = useLocalStorage(
    "tool:budget-planner:safety-buffer",
    "",
  );
  const [expenses, setExpenses, isHydrated] = useLocalStorage<ExpenseCategory[]>(
    "tool:budget-planner:expenses",
    createDefaultExpenses(),
  );
  const [calculated, setCalculated] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [adjustments, setAdjustments] = useState<ExpenseAdjustments>({});

  const result = useMemo(() => {
    const income = Number(monthlyIncome);
    const savings = Number(goalSavings);
    const buffer = Number(safetyBuffer);

    if (
      !Number.isFinite(income) ||
      !Number.isFinite(savings) ||
      !Number.isFinite(buffer) ||
      income <= 0 ||
      savings < 0 ||
      buffer < 0
    ) {
      return null;
    }

    const parsed = expenses.map((item) => ({
      ...item,
      name: getCategoryDisplayName(item, t),
      parsedAmount: parseAmount(item.amount),
    }));

    const totals: Record<ExpensePriority, number> = {
      essential: 0,
      flexible: 0,
      luxury: 0,
    };

    for (const item of parsed) {
      totals[item.priority] += item.parsedAmount;
    }

    const totalExpenses =
      totals.essential + totals.flexible + totals.luxury;
    const totalRequired = totalExpenses + savings + buffer;
    const surplus = income - totalRequired;
    const gap = surplus < 0 ? Math.abs(surplus) : 0;

    const reducible = parsed.filter(
      (item) =>
        (item.priority === "flexible" || item.priority === "luxury") &&
        item.parsedAmount > 0,
    );

    return {
      income,
      savings,
      buffer,
      totals,
      totalExpenses,
      totalRequired,
      surplus,
      gap,
      parsed,
      reducible,
    } satisfies BudgetPlanResult;
  }, [monthlyIncome, goalSavings, safetyBuffer, expenses, t]);

  const displayPlan = useMemo(() => {
    if (!result) return null;
    return buildDisplayPlan(result, adjustments);
  }, [result, adjustments]);

  const handleRestore = useCallback(
    (entry: CalculationHistoryEntry) => {
      setMonthlyIncome(String(entry.inputs.monthlyIncome ?? ""));
      setGoalSavings(String(entry.inputs.goalSavings ?? ""));
      setSafetyBuffer(String(entry.inputs.safetyBuffer ?? ""));
      if (Array.isArray(entry.inputs.expenses)) {
        setExpenses(entry.inputs.expenses as ExpenseCategory[]);
      } else if (entry.inputs.fixedExpenses !== undefined) {
        setExpenses([
          createExpense({
            name: t("legacy.fixedExpenses"),
            priority: "essential",
            amount: String(entry.inputs.fixedExpenses),
          }),
        ]);
      }
      setAdjustments(
        (entry.inputs.adjustments as ExpenseAdjustments | undefined) ?? {},
      );
      setCalculated(true);
      setSaveName(entry.name);
    },
    [setMonthlyIncome, setGoalSavings, setSafetyBuffer, setExpenses, t],
  );

  useCalculationRestore("budget-simple", handleRestore);

  const updateExpense = (id: string, patch: Partial<ExpenseCategory>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setCalculated(false);
    setAdjustments({});
  };

  const addCategory = () => {
    setExpenses((prev) => [
      ...prev,
      createExpense({ name: tc("custom"), priority: "flexible" }),
    ]);
    setCalculated(false);
    setAdjustments({});
  };

  const removeCategory = (id: string) => {
    setExpenses((prev) =>
      prev.length <= 1 ? prev : prev.filter((item) => item.id !== id),
    );
    setCalculated(false);
    setAdjustments((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleCalculate = () => {
    if (!result) return;
    setAdjustments({});
    setCalculated(true);
  };

  const handleClear = () => {
    setMonthlyIncome("");
    setGoalSavings("");
    setSafetyBuffer("");
    setExpenses(createDefaultExpenses());
    setCalculated(false);
    setSaveName("");
    setAdjustments({});
  };

  const handleAdjust = (id: string, reductionPercent: number) => {
    setAdjustments((prev) => ({ ...prev, [id]: reductionPercent }));
  };

  const hasInput =
    monthlyIncome !== "" ||
    goalSavings !== "" ||
    safetyBuffer !== "" ||
    expenses.some(
      (item) => item.amount !== "" || item.name !== "" || item.starterKey,
    );

  if (!isHydrated) {
    return <p className="text-sm text-slate-500">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-md">
        <p className="label-caption mb-4 text-blue-500">{t("setup.caption")}</p>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="monthly-income" className="label-caption mb-2 block">
              {t("setup.monthlyIncome")}
            </label>
            <input
              id="monthly-income"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="input-field py-3.5 font-mono text-base"
              placeholder={tc("placeholderDecimal")}
              value={monthlyIncome}
              onChange={(e) => {
                setMonthlyIncome(e.target.value);
                setCalculated(false);
              }}
            />
          </div>

          <div>
            <label htmlFor="goal-savings" className="label-caption mb-2 block">
              {t("setup.savingsGoal")}
            </label>
            <input
              id="goal-savings"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="input-field py-3.5 font-mono text-base"
              placeholder={tc("placeholderDecimal")}
              value={goalSavings}
              onChange={(e) => {
                setGoalSavings(e.target.value);
                setCalculated(false);
              }}
            />
          </div>

          <div>
            <label htmlFor="safety-buffer" className="label-caption mb-2 block">
              {t("setup.safetyBuffer")}
            </label>
            <input
              id="safety-buffer"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="input-field py-3.5 font-mono text-base"
              placeholder={t("setup.safetyBufferPlaceholder")}
              value={safetyBuffer}
              onChange={(e) => {
                setSafetyBuffer(e.target.value);
                setCalculated(false);
              }}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              {t("setup.safetyBufferHint")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="label-caption">{t("expenses.caption")}</p>
          <button
            type="button"
            className="btn-secondary py-2.5"
            onClick={addCategory}
          >
            {t("expenses.addCategory")}
          </button>
        </div>

        <ul className="space-y-3">
          {expenses.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl bg-white p-4 shadow-md sm:p-5"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_120px_140px_auto] sm:items-end">
                <div>
                  <label
                    htmlFor={`name-${item.id}`}
                    className="label-caption mb-2 block"
                  >
                    {tc("category")}
                  </label>
                  <input
                    id={`name-${item.id}`}
                    type="text"
                    className="input-field py-3 text-base"
                    value={
                      item.starterKey
                        ? getCategoryDisplayName(item, t)
                        : item.name
                    }
                    onChange={(e) =>
                      updateExpense(item.id, {
                        name: e.target.value,
                        starterKey: undefined,
                      })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor={`amount-${item.id}`}
                    className="label-caption mb-2 block"
                  >
                    {tc("amount")}
                  </label>
                  <input
                    id={`amount-${item.id}`}
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    className="input-field py-3 font-mono text-base"
                    placeholder={tc("placeholderAmount")}
                    value={item.amount}
                    onChange={(e) =>
                      updateExpense(item.id, { amount: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor={`priority-${item.id}`}
                    className="label-caption mb-2 block"
                  >
                    {tc("priority")}
                  </label>
                  <select
                    id={`priority-${item.id}`}
                    className="input-field py-3 text-base"
                    value={item.priority}
                    onChange={(e) =>
                      updateExpense(item.id, {
                        priority: e.target.value as ExpensePriority,
                      })
                    }
                  >
                    {(["essential", "flexible", "luxury"] as ExpensePriority[]).map(
                      (key) => (
                        <option key={key} value={key}>
                          {t(`priorities.${key}.label`)}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  className="btn-secondary py-3"
                  onClick={() => removeCategory(item.id)}
                  disabled={expenses.length <= 1}
                  aria-label={tc("removeNamed", {
                    name: getCategoryDisplayName(item, t),
                  })}
                >
                  {tc("remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={!result}
          onClick={handleCalculate}
        >
          {t("actions.planBudget")}
        </button>
        {hasInput && (
          <button type="button" className="btn-secondary" onClick={handleClear}>
            {tc("reset")}
          </button>
        )}
      </div>

      {result && displayPlan && calculated ? (
        <div className="space-y-4">
          <CalculationSavePanel
            toolSlug="budget-simple"
            saveName={saveName}
            onSaveNameChange={setSaveName}
            inputs={{
              monthlyIncome,
              goalSavings,
              safetyBuffer,
              expenses,
              adjustments,
            }}
            resultSummary={
              displayPlan.gap > 0
                ? t("resultSummary.gap", {
                    amount: formatCurrency(displayPlan.gap),
                  })
                : t("resultSummary.surplus", {
                    amount: formatCurrency(displayPlan.surplus),
                  })
            }
          />

          {displayPlan.gap > 0 ? (
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 px-6 py-6 shadow-md">
              <p className="label-caption mb-2 text-rose-600">
                {t("results.gapAnalysis.caption")}
              </p>
              <p className="text-lg font-semibold leading-relaxed text-rose-900">
                {t("results.gapAnalysis.shortBy", {
                  gap: formatCurrency(displayPlan.gap),
                  savings: formatCurrency(displayPlan.savings),
                  buffer: formatCurrency(displayPlan.buffer),
                })}
              </p>
              <p className="mt-3 text-sm text-rose-700/80">
                {t("results.gapAnalysis.required", {
                  required: formatCurrency(displayPlan.totalRequired),
                  income: formatCurrency(displayPlan.income),
                })}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-6 py-6 text-center shadow-md">
              <p className="label-caption mb-2 text-emerald-600">
                {t("results.balanced.caption")}
              </p>
              <p className="font-mono text-3xl font-bold text-emerald-700 sm:text-4xl">
                {formatCurrency(displayPlan.surplus)}
              </p>
              <p className="mt-2 text-sm text-emerald-800">
                {t("results.balanced.hint")}
              </p>
            </div>
          )}

          <div>
            <p className="label-caption mb-4">{t("decisionBoard.caption")}</p>
            <DecisionBoard
              expenses={displayPlan.parsed}
              totals={displayPlan.totals}
            />
          </div>

          {result.gap > 0 && (
            <CloseTheGapSection
              reducible={result.reducible}
              gap={result.gap}
              adjustments={adjustments}
              onAdjust={handleAdjust}
            />
          )}

          <div className="rounded-2xl bg-white px-5 py-4 shadow-md">
            <p className="label-caption mb-3">{t("allocation.caption")}</p>
            <div className="mb-3 flex h-4 overflow-hidden rounded-full bg-slate-100">
              {displayPlan.income > 0 && (
                <>
                  <div
                    className="bg-blue-500 transition-all duration-200"
                    style={{
                      width: `${(displayPlan.totals.essential / displayPlan.income) * 100}%`,
                    }}
                    title={t("allocation.essential")}
                  />
                  <div
                    className="bg-amber-500 transition-all duration-200"
                    style={{
                      width: `${(displayPlan.totals.flexible / displayPlan.income) * 100}%`,
                    }}
                    title={t("allocation.flexible")}
                  />
                  <div
                    className="bg-rose-500 transition-all duration-200"
                    style={{
                      width: `${(displayPlan.totals.luxury / displayPlan.income) * 100}%`,
                    }}
                    title={t("allocation.luxury")}
                  />
                  <div
                    className="bg-violet-400 transition-all duration-200"
                    style={{
                      width: `${(displayPlan.savings / displayPlan.income) * 100}%`,
                    }}
                    title={t("allocation.savingsGoal")}
                  />
                  <div
                    className="bg-indigo-400 transition-all duration-200"
                    style={{
                      width: `${(displayPlan.buffer / displayPlan.income) * 100}%`,
                    }}
                    title={t("allocation.safetyBuffer")}
                  />
                  {displayPlan.surplus > 0 && (
                    <div
                      className="bg-emerald-400 transition-all duration-200"
                      style={{
                        width: `${(displayPlan.surplus / displayPlan.income) * 100}%`,
                      }}
                      title={t("allocation.surplus")}
                    />
                  )}
                </>
              )}
            </div>
            <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
              <div className="flex justify-between">
                <span>{t("allocation.essential")}</span>
                <span className="font-mono">
                  {formatCurrency(displayPlan.totals.essential)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("allocation.flexible")}</span>
                <span
                  className={`font-mono transition-colors duration-200 ${
                    displayPlan.totals.flexible < result.totals.flexible
                      ? "font-semibold text-emerald-600"
                      : ""
                  }`}
                >
                  {formatCurrency(displayPlan.totals.flexible)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("allocation.luxury")}</span>
                <span
                  className={`font-mono transition-colors duration-200 ${
                    displayPlan.totals.luxury < result.totals.luxury
                      ? "font-semibold text-emerald-600"
                      : ""
                  }`}
                >
                  {formatCurrency(displayPlan.totals.luxury)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("allocation.savingsGoal")}</span>
                <span className="font-mono">{formatCurrency(displayPlan.savings)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("allocation.safetyBuffer")}</span>
                <span className="font-mono">{formatCurrency(displayPlan.buffer)}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>{t("allocation.surplusGap")}</span>
                <span
                  className={`font-mono transition-colors duration-200 ${
                    displayPlan.surplus >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {displayPlan.surplus >= 0
                    ? formatCurrency(displayPlan.surplus)
                    : `−${formatCurrency(displayPlan.gap)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400">{t("emptyState")}</p>
      )}
    </div>
  );
}

/** @deprecated Use BudgetPlanner */
export const BudgetSimple = BudgetPlanner;
