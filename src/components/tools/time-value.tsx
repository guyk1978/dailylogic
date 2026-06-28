"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Clock,
  Hammer,
  ListChecks,
  UserRoundCheck,
} from "lucide-react";
import { CalculationSavePanel } from "@/components/tools/calculation-save-panel";
import { useCalculationRestore } from "@/hooks/use-calculation-restore";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";

export type ConfidenceLevel = "low" | "medium" | "high";
export type Recommendation = "Do Yourself" | "Delegate";
export type FactorLevel = "Low" | "Medium" | "High";

export interface Evaluation {
  opportunityCost: number;
  weightedErrorCost: number;
  diyEffectiveCost: number;
  delegateCost: number;
  mathFavorsDIY: boolean;
  complexityScore: number;
  recommendation: Recommendation;
  summary: string;
  factors: {
    confidence: FactorLevel;
    qualityNeeded: FactorLevel;
    priceGap: FactorLevel;
  };
}

const CONFIDENCE_OPTIONS: { value: ConfidenceLevel; label: string }[] = [
  { value: "low", label: "Low — I'd probably need help" },
  { value: "medium", label: "Medium — I could manage with effort" },
  { value: "high", label: "High — I've done this before" },
];

const ERROR_WEIGHT: Record<ConfidenceLevel, number> = {
  low: 1,
  medium: 0.5,
  high: 0.15,
};

const CONFIDENCE_PRESSURE: Record<ConfidenceLevel, number> = {
  low: 85,
  medium: 50,
  high: 15,
};

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hour${rounded === 1 ? "" : "s"}`;
}

function factorLevel(value: number): FactorLevel {
  if (value <= 3) return "Low";
  if (value <= 7) return "Medium";
  return "High";
}

function priceGapLevel(
  diyCost: number,
  delegateCost: number,
): FactorLevel {
  const gap = Math.abs(delegateCost - diyCost);
  const base = Math.max(diyCost, delegateCost, 1);
  const ratio = gap / base;
  if (ratio < 0.15) return "Low";
  if (ratio < 0.4) return "Medium";
  return "High";
}

function confidenceFactorLabel(level: ConfidenceLevel): FactorLevel {
  if (level === "low") return "Low";
  if (level === "medium") return "Medium";
  return "High";
}

function computeEvaluation(
  wage: number,
  cost: number,
  hours: number,
  confidence: ConfidenceLevel,
  quality: number,
  errorCost: number,
): Evaluation {
  const opportunityCost = wage * hours;
  const weightedErrorCost = errorCost * ERROR_WEIGHT[confidence];
  const diyEffectiveCost = opportunityCost + weightedErrorCost;
  const delegateCost = cost;
  const mathFavorsDIY = delegateCost > diyEffectiveCost;

  const qualityPressure = ((quality - 1) / 9) * 100;
  const complexityScore = Math.round(
    qualityPressure * 0.65 + CONFIDENCE_PRESSURE[confidence] * 0.35,
  );

  const highQuality = quality >= 9;
  const elevatedQuality = quality >= 7;

  let recommendation: Recommendation;
  let summary: string;

  if (highQuality && mathFavorsDIY && confidence !== "high") {
    recommendation = "Delegate";
    summary =
      "The math says DIY, but the complexity score suggests hiring a professional.";
  } else if (complexityScore >= 70 && mathFavorsDIY) {
    recommendation = "Delegate";
    summary =
      "The math says DIY, but the complexity score suggests hiring a professional.";
  } else if (
    elevatedQuality &&
    mathFavorsDIY &&
    confidence === "low"
  ) {
    recommendation = "Delegate";
    summary =
      "DIY saves on paper, but low confidence and high quality needs favor a pro.";
  } else if (!mathFavorsDIY && complexityScore >= 35) {
    recommendation = "Delegate";
    summary =
      "Both the numbers and complexity point toward hiring a professional.";
  } else if (mathFavorsDIY && complexityScore < 40) {
    recommendation = "Do Yourself";
    summary =
      "The numbers and your skill level support doing this yourself.";
  } else if (!mathFavorsDIY) {
    recommendation = "Delegate";
    summary = "Hiring a professional is the smarter financial choice.";
  } else if (mathFavorsDIY) {
    recommendation = "Do Yourself";
    summary =
      "DIY is viable — weigh the quality bar before you commit.";
  } else {
    recommendation = "Delegate";
    summary =
      "Leaning pro — moderate complexity offsets DIY savings.";
  }

  return {
    opportunityCost,
    weightedErrorCost,
    diyEffectiveCost,
    delegateCost,
    mathFavorsDIY,
    complexityScore,
    recommendation,
    summary,
    factors: {
      confidence: confidenceFactorLabel(confidence),
      qualityNeeded: factorLevel(quality),
      priceGap: priceGapLevel(diyEffectiveCost, delegateCost),
    },
  };
}

function FactorChecklist({ factors }: { factors: Evaluation["factors"] }) {
  const items = [
    { label: "Confidence", value: factors.confidence },
    { label: "Quality needed", value: factors.qualityNeeded },
    { label: "Price gap", value: factors.priceGap },
  ] as const;

  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-md">
      <p className="label-caption mb-3">Decision factors</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-blue-500" aria-hidden />
              {item.label}
            </span>
            <span className="font-semibold text-slate-800">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TimeValue() {
  const [hourlyWage, setHourlyWage] = useLocalStorage(
    "tool:time-value:hourly-wage",
    "",
  );
  const [taskCost, setTaskCost] = useLocalStorage(
    "tool:time-value:task-cost",
    "",
  );
  const [timeRequired, setTimeRequired] = useLocalStorage(
    "tool:time-value:time-required",
    "",
  );
  const [confidence, setConfidence] = useLocalStorage<ConfidenceLevel>(
    "tool:time-value:confidence",
    "medium",
  );
  const [qualityRequirement, setQualityRequirement] = useLocalStorage(
    "tool:time-value:quality",
    5,
  );
  const [errorCost, setErrorCost] = useLocalStorage(
    "tool:time-value:error-cost",
    "",
  );
  const [calculated, setCalculated] = useState(false);
  const [saveName, setSaveName] = useState("");

  const evaluation = useMemo(() => {
    const wage = Number(hourlyWage);
    const cost = Number(taskCost);
    const hours = Number(timeRequired);
    const repairCost = Number(errorCost);

    if (
      !Number.isFinite(wage) ||
      !Number.isFinite(cost) ||
      !Number.isFinite(hours) ||
      !Number.isFinite(repairCost) ||
      wage <= 0 ||
      cost < 0 ||
      hours <= 0 ||
      repairCost < 0
    ) {
      return null;
    }

    return computeEvaluation(
      wage,
      cost,
      hours,
      confidence,
      qualityRequirement,
      repairCost,
    );
  }, [
    hourlyWage,
    taskCost,
    timeRequired,
    confidence,
    qualityRequirement,
    errorCost,
  ]);

  const handleRestore = useCallback(
    (entry: CalculationHistoryEntry) => {
      setHourlyWage(String(entry.inputs.hourlyWage ?? ""));
      setTaskCost(String(entry.inputs.taskCost ?? ""));
      setTimeRequired(String(entry.inputs.timeRequired ?? ""));
      if (entry.inputs.confidence !== undefined) {
        setConfidence(entry.inputs.confidence as ConfidenceLevel);
      }
      if (entry.inputs.qualityRequirement !== undefined) {
        setQualityRequirement(Number(entry.inputs.qualityRequirement));
      }
      if (entry.inputs.errorCost !== undefined) {
        setErrorCost(String(entry.inputs.errorCost));
      }
      setCalculated(true);
      setSaveName(entry.name);
    },
    [
      setHourlyWage,
      setTaskCost,
      setTimeRequired,
      setConfidence,
      setQualityRequirement,
      setErrorCost,
    ],
  );

  useCalculationRestore("time-value", handleRestore);

  const handleEvaluate = () => {
    if (!evaluation) return;
    setCalculated(true);
  };

  const handleClear = () => {
    setHourlyWage("");
    setTaskCost("");
    setTimeRequired("");
    setConfidence("medium");
    setQualityRequirement(5);
    setErrorCost("");
    setCalculated(false);
    setSaveName("");
  };

  const hasInput =
    hourlyWage !== "" ||
    taskCost !== "" ||
    timeRequired !== "" ||
    errorCost !== "";

  const invalidate = () => setCalculated(false);

  const recommendedCost =
    evaluation?.recommendation === "Delegate"
      ? evaluation.delegateCost
      : evaluation?.diyEffectiveCost;

  const hoursSaved =
    evaluation && calculated ? Number(timeRequired) : null;
  const hourlyRate =
    evaluation && calculated ? Number(hourlyWage) : null;
  const isDelegate = evaluation?.recommendation === "Delegate";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-md">
        <p className="label-caption mb-4 text-blue-500">The Numbers</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="hourly-wage" className="label-caption mb-2 block">
              Hourly wage
            </label>
            <input
              id="hourly-wage"
              type="number"
              min={0}
              step="0.01"
              className="input-field py-3.5 font-mono text-base"
              placeholder="0.00"
              value={hourlyWage}
              onChange={(e) => {
                setHourlyWage(e.target.value);
                invalidate();
              }}
            />
          </div>

          <div>
            <label htmlFor="task-cost" className="label-caption mb-2 block">
              Professional cost
            </label>
            <input
              id="task-cost"
              type="number"
              min={0}
              step="0.01"
              className="input-field py-3.5 font-mono text-base"
              placeholder="0.00"
              value={taskCost}
              onChange={(e) => {
                setTaskCost(e.target.value);
                invalidate();
              }}
            />
          </div>

          <div>
            <label htmlFor="time-required" className="label-caption mb-2 block">
              Time required (hours)
            </label>
            <input
              id="time-required"
              type="number"
              min={0}
              step="0.25"
              className="input-field py-3.5 font-mono text-base"
              placeholder="0.0"
              value={timeRequired}
              onChange={(e) => {
                setTimeRequired(e.target.value);
                invalidate();
              }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-md">
        <p className="label-caption mb-4 text-blue-500">Skill &amp; Risk</p>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="confidence" className="label-caption mb-2 block">
              How confident are you in doing this yourself?
            </label>
            <select
              id="confidence"
              className="input-field py-3 text-base"
              value={confidence}
              onChange={(e) => {
                setConfidence(e.target.value as ConfidenceLevel);
                invalidate();
              }}
            >
              {CONFIDENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="error-cost" className="label-caption mb-2 block">
              Potential error / repair cost
            </label>
            <input
              id="error-cost"
              type="number"
              min={0}
              step="0.01"
              className="input-field py-3.5 font-mono text-base"
              placeholder="0.00"
              value={errorCost}
              onChange={(e) => {
                setErrorCost(e.target.value);
                invalidate();
              }}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              What might it cost if things go wrong?
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="quality" className="label-caption">
              Quality requirement
            </label>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-bold text-blue-700">
              {qualityRequirement}/10
            </span>
          </div>
          <input
            id="quality"
            type="range"
            min={1}
            max={10}
            step={1}
            value={qualityRequirement}
            onChange={(e) => {
              setQualityRequirement(Number(e.target.value));
              invalidate();
            }}
            className="h-3 w-full cursor-pointer accent-blue-500"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Good enough</span>
            <span>Professional grade</span>
          </div>
          {qualityRequirement >= 9 && (
            <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              High quality bar — DIY is penalized unless confidence is high.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={!evaluation}
          onClick={handleEvaluate}
        >
          Evaluate Decision
        </button>
        {hasInput && (
          <button type="button" className="btn-secondary" onClick={handleClear}>
            Reset
          </button>
        )}
      </div>

      {evaluation && calculated ? (
        <div className="space-y-4">
          <CalculationSavePanel
            toolSlug="time-value"
            toolName="Delegate or Do"
            saveName={saveName}
            onSaveNameChange={setSaveName}
            inputs={{
              hourlyWage,
              taskCost,
              timeRequired,
              confidence,
              qualityRequirement,
              errorCost,
            }}
            resultSummary={`${evaluation.recommendation} · ${formatCurrency(recommendedCost ?? 0)}`}
          />

          <div
            className={`rounded-2xl px-6 py-8 shadow-md ${
              evaluation.recommendation === "Do Yourself"
                ? "border-2 border-orange-300 bg-orange-50"
                : "border-2 border-emerald-300 bg-emerald-50"
            }`}
          >
            <div className="mb-6 flex items-center justify-center gap-2">
              {evaluation.recommendation === "Do Yourself" ? (
                <Hammer className="h-6 w-6 text-orange-600" aria-hidden />
              ) : (
                <UserRoundCheck className="h-6 w-6 text-emerald-600" aria-hidden />
              )}
              <p
                className={`label-caption ${
                  evaluation.recommendation === "Do Yourself"
                    ? "text-orange-600"
                    : "text-emerald-600"
                }`}
              >
                Final recommendation
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/70 px-4 py-3 text-center ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Calculated cost
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-slate-900">
                  {formatCurrency(recommendedCost ?? 0)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {evaluation.recommendation === "Delegate"
                    ? "Professional quote"
                    : "DIY time + risk"}
                </p>
              </div>

              <div className="rounded-xl bg-white/70 px-4 py-3 text-center ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Confidence level
                </p>
                <p className="mt-1 text-xl font-bold capitalize text-slate-900">
                  {confidence}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Complexity score {evaluation.complexityScore}/100
                </p>
              </div>

              <div className="rounded-xl bg-white/70 px-4 py-3 text-center ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Final recommendation
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    evaluation.recommendation === "Do Yourself"
                      ? "text-orange-700"
                      : "text-emerald-700"
                  }`}
                >
                  {evaluation.recommendation}
                </p>
              </div>
            </div>

            {isDelegate && hoursSaved !== null && hoursSaved > 0 && (
              <div className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-center ring-1 ring-emerald-200">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-emerald-600">
                  <Clock className="h-4 w-4" aria-hidden />
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    Time saved
                  </p>
                </div>
                <p className="font-mono text-2xl font-bold text-emerald-900">
                  {formatHours(hoursSaved)}
                </p>
                <p className="mt-0.5 text-xs text-emerald-700/70">
                  Reclaimed by not doing this yourself
                </p>
              </div>
            )}

            <p className="mx-auto mt-6 max-w-lg text-center text-sm leading-relaxed text-slate-700">
              {evaluation.summary}
            </p>
          </div>

          {isDelegate &&
            hoursSaved !== null &&
            hoursSaved > 0 &&
            hourlyRate !== null &&
            hourlyRate > 0 && (
              <>
                <p className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-center text-sm leading-relaxed text-slate-600">
                  By delegating this, you reclaim{" "}
                  <span className="font-semibold text-slate-800">
                    {formatHours(hoursSaved)}
                  </span>
                  . If your time is worth{" "}
                  <span className="font-mono font-medium text-slate-700">
                    {formatCurrency(hourlyRate)}
                  </span>
                  , this decision adds{" "}
                  <span className="font-mono font-semibold text-blue-700">
                    {formatCurrency(evaluation.opportunityCost)}
                  </span>{" "}
                  value to your personal productivity.
                </p>

                <div className="rounded-2xl bg-white px-5 py-4 shadow-md ring-1 ring-slate-100">
                  <div className="mb-3 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-blue-500" aria-hidden />
                    <p className="label-caption text-blue-500">Next step</p>
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    Since you decided to Delegate:
                  </p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
                    <li>Get 3 quotes.</li>
                    <li>Verify references.</li>
                    <li>Set a clear deadline.</li>
                  </ol>
                </div>
              </>
            )}

          <div className="rounded-2xl bg-white px-5 py-4 shadow-md">
            <p className="label-caption mb-3">Cost breakdown</p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-slate-500">Your time (opportunity cost)</span>
                <span className="font-mono font-medium">
                  {formatCurrency(evaluation.opportunityCost)}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-slate-500">Weighted error risk</span>
                <span className="font-mono font-medium">
                  {formatCurrency(evaluation.weightedErrorCost)}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-orange-50 px-3 py-2">
                <span className="text-orange-700">DIY effective cost</span>
                <span className="font-mono font-semibold text-orange-800">
                  {formatCurrency(evaluation.diyEffectiveCost)}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-emerald-50 px-3 py-2">
                <span className="text-emerald-700">Professional cost</span>
                <span className="font-mono font-semibold text-emerald-800">
                  {formatCurrency(evaluation.delegateCost)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Pure math favors{" "}
              <strong className="text-slate-600">
                {evaluation.mathFavorsDIY ? "Do Yourself" : "Delegate"}
              </strong>
              . Final advice weighs quality, confidence, and hidden DIY costs.
            </p>
          </div>

          <FactorChecklist factors={evaluation.factors} />
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400">
          Fill in the numbers and skill assessment, then evaluate your decision.
        </p>
      )}
    </div>
  );
}
