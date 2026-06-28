"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
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
import { useToolTranslation } from "@/hooks/use-tool-translation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";

export type ConfidenceLevel = "low" | "medium" | "high";
export type Recommendation = "Do Yourself" | "Delegate";
export type FactorLevel = "Low" | "Medium" | "High";

export type SummaryKey =
  | "mathSaysDiyComplexitySuggestsPro"
  | "diySavesLowConfidenceHighQuality"
  | "numbersAndComplexityPointPro"
  | "numbersAndSkillSupportDiy"
  | "hiringSmarterChoice"
  | "diyViableWeighQuality"
  | "leaningProModerateComplexity";

export interface Evaluation {
  opportunityCost: number;
  weightedErrorCost: number;
  diyEffectiveCost: number;
  delegateCost: number;
  mathFavorsDIY: boolean;
  complexityScore: number;
  recommendation: Recommendation;
  summaryKey: SummaryKey;
  factors: {
    confidence: FactorLevel;
    qualityNeeded: FactorLevel;
    priceGap: FactorLevel;
  };
}

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ["low", "medium", "high"];

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

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatHours(
  hours: number,
  tc: TranslateFn,
): string {
  const rounded = Math.round(hours * 10) / 10;
  return tc(rounded === 1 ? "hour_one" : "hour_other", { count: rounded });
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

function factorLevelLabel(level: FactorLevel, tc: TranslateFn): string {
  if (level === "Low") return tc("levelLow");
  if (level === "Medium") return tc("levelMedium");
  return tc("levelHigh");
}

function confidenceLevelLabel(level: ConfidenceLevel, tc: TranslateFn): string {
  if (level === "low") return tc("levelLow");
  if (level === "medium") return tc("levelMedium");
  return tc("levelHigh");
}

function recommendationLabel(
  recommendation: Recommendation,
  t: TranslateFn,
): string {
  return recommendation === "Do Yourself"
    ? t("recommendation.doYourself")
    : t("recommendation.delegate");
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
  let summaryKey: SummaryKey;

  if (highQuality && mathFavorsDIY && confidence !== "high") {
    recommendation = "Delegate";
    summaryKey = "mathSaysDiyComplexitySuggestsPro";
  } else if (complexityScore >= 70 && mathFavorsDIY) {
    recommendation = "Delegate";
    summaryKey = "mathSaysDiyComplexitySuggestsPro";
  } else if (
    elevatedQuality &&
    mathFavorsDIY &&
    confidence === "low"
  ) {
    recommendation = "Delegate";
    summaryKey = "diySavesLowConfidenceHighQuality";
  } else if (!mathFavorsDIY && complexityScore >= 35) {
    recommendation = "Delegate";
    summaryKey = "numbersAndComplexityPointPro";
  } else if (mathFavorsDIY && complexityScore < 40) {
    recommendation = "Do Yourself";
    summaryKey = "numbersAndSkillSupportDiy";
  } else if (!mathFavorsDIY) {
    recommendation = "Delegate";
    summaryKey = "hiringSmarterChoice";
  } else if (mathFavorsDIY) {
    recommendation = "Do Yourself";
    summaryKey = "diyViableWeighQuality";
  } else {
    recommendation = "Delegate";
    summaryKey = "leaningProModerateComplexity";
  }

  return {
    opportunityCost,
    weightedErrorCost,
    diyEffectiveCost,
    delegateCost,
    mathFavorsDIY,
    complexityScore,
    recommendation,
    summaryKey,
    factors: {
      confidence: confidenceFactorLabel(confidence),
      qualityNeeded: factorLevel(quality),
      priceGap: priceGapLevel(diyEffectiveCost, delegateCost),
    },
  };
}

function FactorChecklist({ factors }: { factors: Evaluation["factors"] }) {
  const { t, tc } = useToolTranslation("time-value");

  const items = [
    { labelKey: "results.factors.confidence", value: factors.confidence },
    { labelKey: "results.factors.qualityNeeded", value: factors.qualityNeeded },
    { labelKey: "results.factors.priceGap", value: factors.priceGap },
  ] as const;

  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-md">
      <p className="label-caption mb-3">{t("results.decisionFactors")}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.labelKey}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-blue-500" aria-hidden />
              {t(item.labelKey)}
            </span>
            <span className="font-semibold text-slate-800">
              {factorLevelLabel(item.value, tc)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderInterpolatedText(
  text: string,
  markers: Record<string, ReactNode>,
): ReactNode[] {
  const pattern = new RegExp(
    `(${Object.keys(markers).map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  );
  return text.split(pattern).map((segment, index) => {
    if (segment in markers) {
      return <span key={index}>{markers[segment]}</span>;
    }
    return segment ? <span key={index}>{segment}</span> : null;
  });
}

export function TimeValue() {
  const { t, tc } = useToolTranslation("time-value");
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

  const hoursMarker = "\u0000H\u0000";
  const rateMarker = "\u0000R\u0000";
  const costMarker = "\u0000C\u0000";
  const recommendationMarker = "\u0000REC\u0000";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-md">
        <p className="label-caption mb-4 text-blue-500">{t("sections.theNumbers")}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="hourly-wage" className="label-caption mb-2 block">
              {t("form.hourlyWage")}
            </label>
            <input
              id="hourly-wage"
              type="number"
              min={0}
              step="0.01"
              className="input-field py-3.5 font-mono text-base"
              placeholder={t("form.currencyPlaceholder")}
              value={hourlyWage}
              onChange={(e) => {
                setHourlyWage(e.target.value);
                invalidate();
              }}
            />
          </div>

          <div>
            <label htmlFor="task-cost" className="label-caption mb-2 block">
              {t("form.professionalCost")}
            </label>
            <input
              id="task-cost"
              type="number"
              min={0}
              step="0.01"
              className="input-field py-3.5 font-mono text-base"
              placeholder={t("form.currencyPlaceholder")}
              value={taskCost}
              onChange={(e) => {
                setTaskCost(e.target.value);
                invalidate();
              }}
            />
          </div>

          <div>
            <label htmlFor="time-required" className="label-caption mb-2 block">
              {t("form.timeRequired")}
            </label>
            <input
              id="time-required"
              type="number"
              min={0}
              step="0.25"
              className="input-field py-3.5 font-mono text-base"
              placeholder={t("form.hoursPlaceholder")}
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
        <p className="label-caption mb-4 text-blue-500">{t("sections.skillRisk")}</p>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="confidence" className="label-caption mb-2 block">
              {t("form.confidenceQuestion")}
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
              {CONFIDENCE_LEVELS.map((value) => (
                <option key={value} value={value}>
                  {t(`confidence.${value}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="error-cost" className="label-caption mb-2 block">
              {t("form.errorCost")}
            </label>
            <input
              id="error-cost"
              type="number"
              min={0}
              step="0.01"
              className="input-field py-3.5 font-mono text-base"
              placeholder={t("form.currencyPlaceholder")}
              value={errorCost}
              onChange={(e) => {
                setErrorCost(e.target.value);
                invalidate();
              }}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              {t("form.errorCostHint")}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="quality" className="label-caption">
              {t("form.qualityRequirement")}
            </label>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-bold text-blue-700">
              {t("form.qualityScore", { value: qualityRequirement })}
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
            <span>{t("form.qualityGoodEnough")}</span>
            <span>{t("form.qualityProfessionalGrade")}</span>
          </div>
          {qualityRequirement >= 9 && (
            <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {t("form.qualityHighWarning")}
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
          {t("actions.evaluate")}
        </button>
        {hasInput && (
          <button type="button" className="btn-secondary" onClick={handleClear}>
            {tc("reset")}
          </button>
        )}
      </div>

      {evaluation && calculated ? (
        <div className="space-y-4">
          <CalculationSavePanel
            toolSlug="time-value"
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
            resultSummary={t("resultSummary", {
              recommendation: recommendationLabel(evaluation.recommendation, t),
              cost: formatCurrency(recommendedCost ?? 0),
            })}
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
                {t("results.finalRecommendation")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/70 px-4 py-3 text-center ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("results.calculatedCost")}
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-slate-900">
                  {formatCurrency(recommendedCost ?? 0)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {evaluation.recommendation === "Delegate"
                    ? t("results.professionalQuote")
                    : t("results.diyTimeAndRisk")}
                </p>
              </div>

              <div className="rounded-xl bg-white/70 px-4 py-3 text-center ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("results.confidenceLevel")}
                </p>
                <p className="mt-1 text-xl font-bold capitalize text-slate-900">
                  {confidenceLevelLabel(confidence, tc)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {t("results.complexityScore", {
                    score: evaluation.complexityScore,
                  })}
                </p>
              </div>

              <div className="rounded-xl bg-white/70 px-4 py-3 text-center ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("results.finalRecommendation")}
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    evaluation.recommendation === "Do Yourself"
                      ? "text-orange-700"
                      : "text-emerald-700"
                  }`}
                >
                  {recommendationLabel(evaluation.recommendation, t)}
                </p>
              </div>
            </div>

            {isDelegate && hoursSaved !== null && hoursSaved > 0 && (
              <div className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-center ring-1 ring-emerald-200">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-emerald-600">
                  <Clock className="h-4 w-4" aria-hidden />
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    {t("results.timeSaved")}
                  </p>
                </div>
                <p className="font-mono text-2xl font-bold text-emerald-900">
                  {formatHours(hoursSaved, tc)}
                </p>
                <p className="mt-0.5 text-xs text-emerald-700/70">
                  {t("results.reclaimedByNotDoingYourself")}
                </p>
              </div>
            )}

            <p className="mx-auto mt-6 max-w-lg text-center text-sm leading-relaxed text-slate-700">
              {t(`summaries.${evaluation.summaryKey}`)}
            </p>
          </div>

          {isDelegate &&
            hoursSaved !== null &&
            hoursSaved > 0 &&
            hourlyRate !== null &&
            hourlyRate > 0 && (
              <>
                <p className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-center text-sm leading-relaxed text-slate-600">
                  {renderInterpolatedText(
                    t("results.delegateProductivity", {
                      hours: hoursMarker,
                      hourlyRate: rateMarker,
                      opportunityCost: costMarker,
                    }),
                    {
                      [hoursMarker]: (
                        <span className="font-semibold text-slate-800">
                          {formatHours(hoursSaved, tc)}
                        </span>
                      ),
                      [rateMarker]: (
                        <span className="font-mono font-medium text-slate-700">
                          {formatCurrency(hourlyRate)}
                        </span>
                      ),
                      [costMarker]: (
                        <span className="font-mono font-semibold text-blue-700">
                          {formatCurrency(evaluation.opportunityCost)}
                        </span>
                      ),
                    },
                  )}
                </p>

                <div className="rounded-2xl bg-white px-5 py-4 shadow-md ring-1 ring-slate-100">
                  <div className="mb-3 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-blue-500" aria-hidden />
                    <p className="label-caption text-blue-500">{t("results.nextStep")}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {t("results.sinceYouDecidedDelegate")}
                  </p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
                    <li>{t("results.nextSteps.getQuotes")}</li>
                    <li>{t("results.nextSteps.verifyReferences")}</li>
                    <li>{t("results.nextSteps.setDeadline")}</li>
                  </ol>
                </div>
              </>
            )}

          <div className="rounded-2xl bg-white px-5 py-4 shadow-md">
            <p className="label-caption mb-3">{t("results.costBreakdown")}</p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-slate-500">{t("results.yourTimeOpportunityCost")}</span>
                <span className="font-mono font-medium">
                  {formatCurrency(evaluation.opportunityCost)}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-slate-500">{t("results.weightedErrorRisk")}</span>
                <span className="font-mono font-medium">
                  {formatCurrency(evaluation.weightedErrorCost)}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-orange-50 px-3 py-2">
                <span className="text-orange-700">{t("results.diyEffectiveCost")}</span>
                <span className="font-mono font-semibold text-orange-800">
                  {formatCurrency(evaluation.diyEffectiveCost)}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-emerald-50 px-3 py-2">
                <span className="text-emerald-700">{t("results.professionalCostLabel")}</span>
                <span className="font-mono font-semibold text-emerald-800">
                  {formatCurrency(evaluation.delegateCost)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {renderInterpolatedText(
                `${t("results.pureMathFavors", {
                  recommendation: recommendationMarker,
                })} ${t("results.finalAdviceNote")}`,
                {
                  [recommendationMarker]: (
                    <strong className="text-slate-600">
                      {recommendationLabel(
                        evaluation.mathFavorsDIY ? "Do Yourself" : "Delegate",
                        t,
                      )}
                    </strong>
                  ),
                },
              )}
            </p>
          </div>

          <FactorChecklist factors={evaluation.factors} />
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400">
          {t("emptyState")}
        </p>
      )}
    </div>
  );
}
