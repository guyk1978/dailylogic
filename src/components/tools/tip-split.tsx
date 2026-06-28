"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { CalculationSavePanel } from "@/components/tools/calculation-save-panel";
import { useCalculationRestore } from "@/hooks/use-calculation-restore";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToolTranslation } from "@/hooks/use-tool-translation";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";

export type ServiceType = "waiter" | "courier" | "other";
export type RatingLevel = 0 | 1 | 2;

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function clampTip(value: number): number {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function computeSuggestedTip(
  t: TranslateFn,
  serviceType: ServiceType,
  waitTime: RatingLevel,
  attitude: RatingLevel,
  issueEncountered: boolean,
): { percent: number; explanation: string } {
  let score = waitTime + attitude;
  if (issueEncountered) score -= 1;

  let base: number;
  if (score <= 1) base = 10;
  else if (score === 2) base = 15;
  else if (score === 3) base = 18;
  else base = 22;

  if (serviceType === "courier") base = Math.max(8, base - 3);
  if (serviceType === "other") base = Math.max(10, base - 2);
  if (issueEncountered) base = Math.max(8, base - 2);

  const percent = clampTip(base);
  const explanation = buildExplanation(
    t,
    percent,
    waitTime,
    attitude,
    issueEncountered,
    serviceType,
  );

  return { percent, explanation };
}

function buildExplanation(
  t: TranslateFn,
  percent: number,
  waitTime: RatingLevel,
  attitude: RatingLevel,
  issueEncountered: boolean,
  serviceType: ServiceType,
): string {
  const negativeKeys: string[] = [];
  const positiveKeys: string[] = [];
  let waitNegativeKey: string | null = null;

  if (waitTime === 0) {
    waitNegativeKey = "explanation.fragments.negative.longWaitTime";
    negativeKeys.push(waitNegativeKey);
  } else if (waitTime === 1) {
    waitNegativeKey = "explanation.fragments.negative.averageWaitTime";
    negativeKeys.push(waitNegativeKey);
  } else {
    positiveKeys.push("explanation.fragments.positive.quickService");
  }

  if (attitude === 0) {
    negativeKeys.push("explanation.fragments.negative.unprofessionalService");
  } else if (attitude === 1) {
    negativeKeys.push("explanation.fragments.negative.averageAttitude");
  } else {
    positiveKeys.push("explanation.fragments.positive.friendlyService");
  }

  if (issueEncountered) {
    negativeKeys.push("explanation.fragments.negative.orderIssue");
  }

  const serviceNote =
    serviceType === "courier"
      ? t("explanation.serviceNotes.courier")
      : serviceType === "other"
        ? t("explanation.serviceNotes.other")
        : "";

  const joinAnd = t("explanation.joinAnd");
  const negatives = negativeKeys.map((key) => t(key));
  const positives = positiveKeys.map((key) => t(key));

  if (waitNegativeKey && attitude === 2 && !issueEncountered) {
    return t("explanation.templates.waitDespiteFriendly", {
      percent,
      waitIssue: t(waitNegativeKey),
      serviceNote,
    });
  }

  if (negatives.length > 0 && positives.length > 0) {
    return t("explanation.templates.mixedDespite", {
      percent,
      negatives: negatives.join(joinAnd),
      positives: positives.join(joinAnd),
      serviceNote,
    });
  }

  if (negatives.length > 0) {
    return t("explanation.templates.negativeOnly", {
      percent,
      negatives: negatives.join(joinAnd),
      serviceNote,
    });
  }

  return t("explanation.templates.positiveOnly", {
    percent,
    positives: positives.join(joinAnd),
    serviceNote,
  });
}

function RatingSlider({
  id,
  label,
  lowLabel,
  midLabel,
  highLabel,
  value,
  onChange,
}: {
  id: string;
  label: string;
  lowLabel: string;
  midLabel: string;
  highLabel: string;
  value: RatingLevel;
  onChange: (value: RatingLevel) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-caption mb-2 block">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={2}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as RatingLevel)}
        className="h-3 w-full cursor-pointer accent-blue-500"
      />
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span className={value === 0 ? "font-semibold text-rose-600" : ""}>
          {lowLabel}
        </span>
        <span className={value === 1 ? "font-semibold text-amber-600" : ""}>
          {midLabel}
        </span>
        <span className={value === 2 ? "font-semibold text-emerald-600" : ""}>
          {highLabel}
        </span>
      </div>
    </div>
  );
}

export function TipSplit() {
  const { t, tc } = useToolTranslation("tip-split");
  const [totalAmount, setTotalAmount] = useLocalStorage(
    "tool:tip-split:total-amount",
    "",
  );
  const [tipPercent, setTipPercent] = useLocalStorage(
    "tool:tip-split:tip-percent",
    15,
  );
  const [people, setPeople] = useLocalStorage("tool:tip-split:people", 2);
  const [serviceType, setServiceType] = useLocalStorage<ServiceType>(
    "tool:tip-split:service-type",
    "waiter",
  );
  const [waitTime, setWaitTime] = useLocalStorage<RatingLevel>(
    "tool:tip-split:wait-time",
    1,
  );
  const [attitude, setAttitude] = useLocalStorage<RatingLevel>(
    "tool:tip-split:attitude",
    1,
  );
  const [issueEncountered, setIssueEncountered] = useLocalStorage(
    "tool:tip-split:issue",
    false,
  );
  const [manualOverride, setManualOverride] = useState(false);
  const [saveName, setSaveName] = useState("");

  const serviceOptions = useMemo(
    () =>
      [
        { value: "waiter" as const, label: t("serviceType.waiter") },
        { value: "courier" as const, label: t("serviceType.courier") },
        { value: "other" as const, label: t("serviceType.other") },
      ] satisfies { value: ServiceType; label: string }[],
    [t],
  );

  const suggestion = useMemo(
    () =>
      computeSuggestedTip(t, serviceType, waitTime, attitude, issueEncountered),
    [t, serviceType, waitTime, attitude, issueEncountered],
  );

  useEffect(() => {
    if (!manualOverride) {
      setTipPercent(suggestion.percent);
    }
  }, [suggestion.percent, manualOverride, setTipPercent]);

  const clampedTip = clampTip(tipPercent);
  const clampedPeople = Math.min(Math.max(people, 1), 99);

  const result = useMemo(() => {
    const total = Number(totalAmount);
    if (!Number.isFinite(total) || total <= 0) return null;

    const tipAmount = total * (clampedTip / 100);
    const totalWithTip = total + tipAmount;
    const perPerson = totalWithTip / clampedPeople;

    return { tipAmount, totalWithTip, perPerson };
  }, [totalAmount, clampedTip, clampedPeople]);

  const handleRestore = useCallback(
    (entry: CalculationHistoryEntry) => {
      setTotalAmount(String(entry.inputs.totalAmount ?? ""));
      setTipPercent(Number(entry.inputs.tipPercent ?? 15));
      setPeople(Number(entry.inputs.people ?? 2));
      if (entry.inputs.serviceType !== undefined) {
        setServiceType(entry.inputs.serviceType as ServiceType);
      }
      if (entry.inputs.waitTime !== undefined) {
        setWaitTime(Number(entry.inputs.waitTime) as RatingLevel);
      }
      if (entry.inputs.attitude !== undefined) {
        setAttitude(Number(entry.inputs.attitude) as RatingLevel);
      }
      if (entry.inputs.issueEncountered !== undefined) {
        setIssueEncountered(Boolean(entry.inputs.issueEncountered));
      }
      setManualOverride(Boolean(entry.inputs.manualOverride));
      setSaveName(entry.name);
    },
    [
      setTotalAmount,
      setTipPercent,
      setPeople,
      setServiceType,
      setWaitTime,
      setAttitude,
      setIssueEncountered,
    ],
  );

  useCalculationRestore("tip-split", handleRestore);

  const handleClear = () => {
    setTotalAmount("");
    setTipPercent(15);
    setPeople(2);
    setServiceType("waiter");
    setWaitTime(1);
    setAttitude(1);
    setIssueEncountered(false);
    setManualOverride(false);
    setSaveName("");
  };

  const applySuggestion = () => {
    setManualOverride(false);
    setTipPercent(suggestion.percent);
  };

  const onRatingChange = <T,>(setter: (v: T) => void, value: T) => {
    setter(value);
  };

  const hasInput =
    totalAmount !== "" ||
    tipPercent !== 15 ||
    people !== 2 ||
    serviceType !== "waiter" ||
    waitTime !== 1 ||
    attitude !== 1 ||
    issueEncountered;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-md">
        <p className="label-caption mb-4 text-blue-500">{t("sections.theBill")}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="total-amount" className="label-caption mb-2 block">
              {t("form.totalAmount")}
            </label>
            <input
              id="total-amount"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="input-field py-3.5 font-mono text-base"
              placeholder={t("form.currencyPlaceholder")}
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="people-count" className="label-caption mb-2 block">
              {t("form.numberOfPeople")}
            </label>
            <input
              id="people-count"
              type="number"
              min={1}
              max={99}
              inputMode="numeric"
              className="input-field py-3.5 font-mono text-base"
              value={people}
              onChange={(e) =>
                setPeople(
                  Math.min(Math.max(Number(e.target.value) || 1, 1), 99),
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-md">
        <p className="label-caption mb-4 text-blue-500">
          {t("sections.serviceContext")}
        </p>
        <label htmlFor="service-type" className="label-caption mb-2 block">
          {t("form.serviceType")}
        </label>
        <select
          id="service-type"
          className="input-field max-w-md py-3 text-base"
          value={serviceType}
          onChange={(e) => {
            setServiceType(e.target.value as ServiceType);
            setManualOverride(false);
          }}
        >
          {serviceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-md">
        <p className="label-caption mb-5 text-blue-500">
          {t("sections.rateExperience")}
        </p>
        <div className="space-y-6">
          <RatingSlider
            id="wait-time"
            label={t("rating.waitTime")}
            lowLabel={t("rating.poor")}
            midLabel={t("rating.average")}
            highLabel={t("rating.good")}
            value={waitTime}
            onChange={(v) => {
              onRatingChange(setWaitTime, v);
              setManualOverride(false);
            }}
          />

          <RatingSlider
            id="attitude"
            label={t("rating.attitude")}
            lowLabel={t("rating.unprofessional")}
            midLabel={t("rating.average")}
            highLabel={t("rating.friendly")}
            value={attitude}
            onChange={(v) => {
              onRatingChange(setAttitude, v);
              setManualOverride(false);
            }}
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded accent-blue-500"
              checked={issueEncountered}
              onChange={(e) => {
                setIssueEncountered(e.target.checked);
                setManualOverride(false);
              }}
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">
                {t("issue.label")}
              </span>
              <span className="text-xs text-slate-500">{t("issue.hint")}</span>
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="tip-percent" className="label-caption">
            {t("tip.percentage")}
          </label>
          <div className="flex items-center gap-2">
            {!manualOverride && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3 w-3" aria-hidden />
                {t("tip.smartSuggested")}
              </span>
            )}
            <input
              id="tip-percent-input"
              type="number"
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              className="input-field w-20 py-2.5 text-center font-mono text-base"
              value={clampedTip}
              onChange={(e) => {
                setTipPercent(
                  clampTip(Number(e.target.value) || 0),
                );
                setManualOverride(true);
              }}
              aria-label={t("tip.percentageAriaLabel")}
            />
            <span className="text-sm font-medium text-slate-500">%</span>
          </div>
        </div>

        <input
          id="tip-percent"
          type="range"
          min={0}
          max={30}
          step={1}
          value={Math.min(clampedTip, 30)}
          onChange={(e) => {
            setTipPercent(Number(e.target.value));
            setManualOverride(true);
          }}
          className="h-3 w-full cursor-pointer accent-blue-500"
          aria-valuemin={0}
          aria-valuemax={30}
          aria-valuenow={clampedTip}
        />

        <div className="mt-3 flex justify-between text-xs text-slate-400">
          <span>{t("tip.scaleLabels.zero")}</span>
          <span>{t("tip.scaleLabels.mid")}</span>
          <span>{t("tip.scaleLabels.max")}</span>
        </div>

        <p className="mt-4 rounded-xl bg-blue-50 px-3 py-2.5 text-sm leading-relaxed text-blue-800/90">
          {suggestion.explanation}
        </p>

        {manualOverride && clampedTip !== suggestion.percent && (
          <button
            type="button"
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            onClick={applySuggestion}
          >
            {t("tip.resetToSuggested", { percent: suggestion.percent })}
          </button>
        )}
      </div>

      {hasInput && (
        <button type="button" className="btn-secondary" onClick={handleClear}>
          {tc("reset")}
        </button>
      )}

      {result ? (
        <div className="space-y-4">
          <CalculationSavePanel
            toolSlug="tip-split"
            saveName={saveName}
            onSaveNameChange={setSaveName}
            inputs={{
              totalAmount,
              tipPercent: clampedTip,
              people: clampedPeople,
              serviceType,
              waitTime,
              attitude,
              issueEncountered,
              manualOverride,
            }}
            resultSummary={t("resultSummary", {
              amount: formatCurrency(result.perPerson),
              count: clampedPeople,
            })}
          />

          <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 px-6 py-8 text-center shadow-md">
            <p className="label-caption mb-2 text-blue-600">
              {t("results.amountPerPerson")}
            </p>
            <p className="font-mono text-4xl font-bold text-blue-600 sm:text-5xl">
              {formatCurrency(result.perPerson)}
            </p>
            <p className="mt-2 text-sm text-blue-700/70">
              {t("results.perPersonSummary", {
                count: clampedPeople,
                peopleLabel: t("results.person", { count: clampedPeople }),
                tipPercent: clampedTip,
              })}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 shadow-md">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{t("results.subtotal")}</span>
              <span className="font-mono">
                {formatCurrency(Number(totalAmount))}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
              <span>
                {t("results.totalTip", { percent: clampedTip })}
              </span>
              <span className="font-mono">{formatCurrency(result.tipAmount)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-medium text-slate-700">
              <span>{t("results.totalBill")}</span>
              <span className="font-mono">
                {formatCurrency(result.totalWithTip)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400">{t("emptyState")}</p>
      )}
    </div>
  );
}
