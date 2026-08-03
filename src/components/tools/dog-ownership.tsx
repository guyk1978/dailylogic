"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dog,
  Download,
  Lightbulb,
  Share2,
  Sparkles,
} from "lucide-react";
import { CalculationSavePanel } from "@/components/tools/calculation-save-panel";
import { useCalculationRestore } from "@/hooks/use-calculation-restore";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLocalizedPath } from "@/hooks/use-localized-path";
import { useToolTranslation } from "@/hooks/use-tool-translation";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";
import { useTranslation } from "@/lib/i18n/provider";
import {
  analyzeDogOwnership,
  calculateDogCosts,
  copyDogCardImage,
  downloadDogCard,
  getDogQuestions,
  isDogSetupComplete,
  type AlonePattern,
  type DogAge,
  type DogAnswers,
  type DogProfile,
  type DogSetup,
  type DogSize,
  type GroomingNeed,
  type LikertValue,
  type TrainingPlan,
} from "@/lib/dog-ownership";
import { easeOut, springSnappy } from "@/lib/motion-presets";
import { answerOptionLabel } from "@/lib/quiz-option-label";
import { ICON_STROKE_WIDTH } from "@/lib/tool-icons";

type Phase = "setup" | "costs" | "quiz" | "result";

const LIKERT: LikertValue[] = [1, 2, 3, 4, 5];
const DEFAULT_SETUP: Partial<DogSetup> = {};

function formatScore(score: number): string {
  return score.toFixed(1);
}

function formatMoney(amount: number): string {
  return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function questionPrompt(
  t: (key: string, options?: Record<string, unknown>) => string,
  questionId: string,
  setup: DogSetup,
  ageAware?: boolean,
  sizeAware?: boolean,
): string {
  if (ageAware) {
    const key = `questions.${questionId}.byAge.${setup.age}`;
    const tailored = t(key);
    if (tailored !== key) return tailored;
  }
  if (sizeAware) {
    const key = `questions.${questionId}.bySize.${setup.size}`;
    const tailored = t(key);
    if (tailored !== key) return tailored;
  }
  return t(`questions.${questionId}.prompt`);
}

export function DogOwnershipCalculator() {
  const { t } = useToolTranslation("dog-ownership-calculator");
  const { t: tCommon } = useTranslation("common");
  const localizePath = useLocalizedPath();
  const toolsPath = localizePath("/tools");
  const dir = useLocaleDirection();
  const rtl = dir === "rtl";
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const NextIcon = rtl ? ArrowLeft : ArrowRight;

  const [setup, setSetup] = useLocalStorage<Partial<DogSetup>>(
    "tool:dog-ownership:setup",
    DEFAULT_SETUP,
  );
  const [answers, setAnswers] = useLocalStorage<DogAnswers>(
    "tool:dog-ownership:answers",
    {},
  );
  const [phase, setPhase] = useState<Phase>("setup");
  const [index, setIndex] = useState(0);
  const [profile, setProfile] = useState<DogProfile | null>(null);
  const [insightOffset, setInsightOffset] = useState(0);
  const [saveName, setSaveName] = useState("");
  const [copied, setCopied] = useState(false);
  const [cardStatus, setCardStatus] = useState<string | null>(null);
  const [cardBusy, setCardBusy] = useState(false);

  const questions = useMemo(() => getDogQuestions(), []);
  const current = questions[index];
  const total = questions.length;
  const quizProgress = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;
  const brandName = tCommon("app.name");
  const setupReady = isDogSetupComplete(setup);
  const currencySymbol = t("currency.symbol");

  const costsPreview = useMemo(
    () => (setupReady ? calculateDogCosts(setup) : null),
    [setup, setupReady],
  );

  const profileLabel = profile ? t(`profiles.${profile.profileId}`) : "";
  const visibleInsights = useMemo(() => {
    if (!profile) return [];
    const rotated = [
      ...profile.insightIds.slice(insightOffset),
      ...profile.insightIds.slice(0, insightOffset),
    ];
    return rotated.slice(0, 3);
  }, [profile, insightOffset]);
  const primaryInsight = visibleInsights[0]
    ? t(`insights.${visibleInsights[0]}`)
    : "";

  const setupLine = useMemo(() => {
    if (!setupReady) return "";
    return [
      t(`setup.size.${setup.size}`),
      t(`setup.age.${setup.age}`),
      t(`setup.alone.${setup.alone}`),
    ].join(" · ");
  }, [setup, setupReady, t]);

  const money = useCallback(
    (amount: number) =>
      t("result.amount", { amount: formatMoney(amount), symbol: currencySymbol }),
    [t, currencySymbol],
  );

  const handleRestore = useCallback(
    (entry: CalculationHistoryEntry) => {
      const restoredSetup = (entry.inputs.setup as DogSetup) ?? null;
      const restoredAnswers = (entry.inputs.answers as DogAnswers) ?? {};
      if (restoredSetup && isDogSetupComplete(restoredSetup)) {
        setSetup(restoredSetup);
      }
      setAnswers(restoredAnswers);
      setSaveName(entry.name);
      if (restoredSetup && isDogSetupComplete(restoredSetup)) {
        const analyzed = analyzeDogOwnership(restoredSetup, restoredAnswers);
        if (analyzed) {
          setProfile(analyzed);
          setPhase("result");
          setInsightOffset(0);
          return;
        }
      }
      if (Object.keys(restoredAnswers).length > 0) {
        setPhase("quiz");
        setIndex(0);
      } else if (restoredSetup) {
        setPhase("costs");
      }
    },
    [setSetup, setAnswers],
  );

  useCalculationRestore("dog-ownership-calculator", handleRestore);

  const patchSetup = <K extends keyof DogSetup>(
    key: K,
    value: DogSetup[K],
  ) => {
    setSetup((prev) => ({ ...prev, [key]: value }));
  };

  const goToCosts = () => {
    if (!setupReady) return;
    setPhase("costs");
  };

  const startQuiz = () => {
    setAnswers({});
    setProfile(null);
    setIndex(0);
    setPhase("quiz");
    setInsightOffset(0);
    setSaveName("");
  };

  const selectAnswer = (value: LikertValue) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const goNext = () => {
    if (!current || answers[current.id] === undefined || !setupReady) return;
    if (index >= total - 1) {
      const analyzed = analyzeDogOwnership(setup, {
        ...answers,
        [current.id]: answers[current.id]!,
      });
      if (analyzed) {
        setProfile(analyzed);
        setPhase("result");
        setInsightOffset(0);
      }
      return;
    }
    setIndex((prev) => prev + 1);
  };

  const goBack = () => {
    if (index <= 0) {
      setPhase("costs");
      return;
    }
    setIndex((prev) => prev - 1);
  };

  const restart = () => {
    setAnswers({});
    setProfile(null);
    setIndex(0);
    setPhase("setup");
    setInsightOffset(0);
    setSaveName("");
    setCardStatus(null);
  };

  const shareText = useMemo(() => {
    if (!profile) return "";
    return t("result.shareText", {
      monthly: formatMoney(profile.costs.recommendedMonthly),
      yearly: formatMoney(profile.costs.yearlyForecast),
      symbol: currencySymbol,
      score: formatScore(profile.overall),
    });
  }, [profile, currencySymbol, t]);

  const copyText = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyText();
      return;
    }
    try {
      await navigator.share({
        title: t("intro.title"),
        text: shareText,
        url: window.location.href,
      });
    } catch {
      // cancelled
    }
  };

  const sharePayload = useMemo(() => {
    if (!profile) return null;
    return {
      brand: brandName,
      title: t("result.caption"),
      profileLabel,
      monthlyLabel: t("result.monthly"),
      monthlyText: money(profile.costs.recommendedMonthly),
      yearlyLabel: t("result.yearly"),
      yearlyText: money(profile.costs.yearlyForecast),
      setupLine,
      readinessLabel: t("result.readiness"),
      readinessText: `${formatScore(profile.overall)}%`,
      insight: primaryInsight,
      footer: t("result.cardFooter"),
      rtl,
    };
  }, [
    profile,
    brandName,
    profileLabel,
    money,
    setupLine,
    primaryInsight,
    t,
    rtl,
  ]);

  const handleDownloadCard = async () => {
    if (!sharePayload) return;
    setCardBusy(true);
    try {
      await downloadDogCard(sharePayload);
      setCardStatus(t("card.saved"));
      window.setTimeout(() => setCardStatus(null), 1800);
    } finally {
      setCardBusy(false);
    }
  };

  const handleCopyCard = async () => {
    if (!sharePayload) return;
    setCardBusy(true);
    try {
      const ok = await copyDogCardImage(sharePayload);
      setCardStatus(ok ? t("card.copied") : t("card.copyFailed"));
      if (!ok) await handleDownloadCard();
      window.setTimeout(() => setCardStatus(null), 1800);
    } finally {
      setCardBusy(false);
    }
  };

  useEffect(() => {
    if (phase !== "quiz") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index, phase]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-5 shadow-md ring-1 ring-orange-100/80 sm:p-6">
        <p className="label-caption mb-2 text-orange-700/80">{t("intro.eyebrow")}</p>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {t("intro.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
          {t("intro.body")}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={easeOut}
            className="space-y-4"
          >
            <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
              <p className="text-lg font-semibold text-slate-900">
                {t("setup.title")}
              </p>
              <p className="mt-1 text-sm text-slate-500">{t("setup.subtitle")}</p>

              <SetupGroup label={t("setup.sizeLabel")}>
                {(["small", "medium", "large"] as DogSize[]).map((value) => (
                  <ChoiceChip
                    key={value}
                    selected={setup.size === value}
                    onClick={() => patchSetup("size", value)}
                    label={t(`setup.size.${value}`)}
                  />
                ))}
              </SetupGroup>

              <SetupGroup label={t("setup.ageLabel")}>
                {(["puppy", "adult", "senior"] as DogAge[]).map((value) => (
                  <ChoiceChip
                    key={value}
                    selected={setup.age === value}
                    onClick={() => patchSetup("age", value)}
                    label={t(`setup.age.${value}`)}
                  />
                ))}
              </SetupGroup>

              <SetupGroup label={t("setup.aloneLabel")}>
                {(["homeMostly", "mixed", "aloneOften"] as AlonePattern[]).map(
                  (value) => (
                    <ChoiceChip
                      key={value}
                      selected={setup.alone === value}
                      onClick={() => patchSetup("alone", value)}
                      label={t(`setup.alone.${value}`)}
                    />
                  ),
                )}
              </SetupGroup>

              <SetupGroup label={t("setup.groomingLabel")}>
                {(["low", "regular"] as GroomingNeed[]).map((value) => (
                  <ChoiceChip
                    key={value}
                    selected={setup.grooming === value}
                    onClick={() => patchSetup("grooming", value)}
                    label={t(`setup.grooming.${value}`)}
                  />
                ))}
              </SetupGroup>

              <SetupGroup label={t("setup.trainingLabel")}>
                {(["none", "planned", "active"] as TrainingPlan[]).map(
                  (value) => (
                    <ChoiceChip
                      key={value}
                      selected={setup.training === value}
                      onClick={() => patchSetup("training", value)}
                      label={t(`setup.training.${value}`)}
                    />
                  ),
                )}
              </SetupGroup>
            </div>

            <button
              type="button"
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={!setupReady}
              onClick={goToCosts}
            >
              {t("setup.continue")}
            </button>
          </motion.div>
        )}

        {phase === "costs" && costsPreview && setupReady && (
          <motion.div
            key="costs"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={easeOut}
            className="space-y-4"
          >
            <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
              <div className="mb-1 flex items-center gap-2">
                <Dog
                  className="h-4 w-4 text-orange-600"
                  strokeWidth={ICON_STROKE_WIDTH}
                />
                <p className="text-lg font-semibold text-slate-900">
                  {t("costs.title")}
                </p>
              </div>
              <p className="text-sm text-slate-500">{t("costs.subtitle")}</p>
              <p className="mt-2 text-xs text-slate-400">{setupLine}</p>

              <CostSection
                title={t("costs.monthly")}
                totalLabel={t("costs.monthlyTotal")}
                total={money(costsPreview.monthlyTotal)}
                lines={costsPreview.monthly}
                t={t}
                money={money}
              />
              <CostSection
                title={t("costs.annual")}
                totalLabel={t("costs.annualTotal")}
                total={money(costsPreview.annualTotal)}
                lines={costsPreview.annual}
                t={t}
                money={money}
              />
              <CostSection
                title={t("costs.oneTime")}
                totalLabel={t("costs.oneTimeTotal")}
                total={money(costsPreview.oneTimeTotal)}
                lines={costsPreview.oneTime}
                t={t}
                money={money}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                onClick={() => setPhase("setup")}
              >
                <BackIcon className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                {t("costs.back")}
              </button>
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2"
                onClick={startQuiz}
              >
                {t("costs.continueQuiz")}
                <NextIcon className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
              </button>
            </div>
          </motion.div>
        )}

        {phase === "quiz" && current && setupReady && (
          <motion.div
            key={`quiz-${current.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={easeOut}
            className="space-y-5"
          >
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="mb-1 text-sm font-semibold text-slate-800">
                {t("quiz.title")}
              </p>
              <p className="mb-3 text-xs text-slate-500">{t("quiz.subtitle")}</p>
              <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  {t("progress.label", { current: index + 1, total })}
                </span>
                <span>{t("progress.percent", { percent: quizProgress })}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-orange-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${quizProgress}%` }}
                  transition={springSnappy}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
              <p className="label-caption mb-3 text-orange-700">
                {t(`result.dimensionLabels.${current.dimension}`)}
              </p>
              <p className="text-lg font-medium leading-relaxed text-slate-900">
                {questionPrompt(
                  t,
                  current.id,
                  setup,
                  current.ageAware,
                  current.sizeAware,
                )}
              </p>
              <div className="mt-6 space-y-2">
                {LIKERT.map((value) => {
                  const selected = answers[current.id] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectAnswer(value)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-start text-sm transition ring-1 ${
                        selected
                          ? "bg-orange-800 font-semibold text-white ring-orange-800"
                          : "bg-slate-50 text-slate-700 ring-slate-100 hover:bg-white hover:ring-orange-200"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          selected
                            ? "bg-white text-orange-800"
                            : "bg-white text-slate-500 ring-1 ring-slate-200"
                        }`}
                      >
                        {value}
                      </span>
                      {answerOptionLabel(t, current.id, value)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                onClick={goBack}
              >
                <BackIcon className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                {t("actions.back")}
              </button>
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={answers[current.id] === undefined}
                onClick={goNext}
              >
                {index >= total - 1 ? t("actions.finish") : t("actions.next")}
                <NextIcon className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
              </button>
            </div>
          </motion.div>
        )}

        {phase === "result" && profile && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={easeOut}
            className="space-y-4"
          >
            <div className="rounded-2xl border-2 border-orange-100 bg-gradient-to-br from-orange-50/80 via-white to-emerald-50 px-6 py-8 text-center shadow-md">
              <p className="label-caption mb-2 text-slate-500">
                {t("result.caption")}
              </p>
              <p className="text-lg font-bold text-slate-900">{profileLabel}</p>
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springSnappy}
                className="mt-3 font-mono text-5xl font-bold text-orange-800 sm:text-6xl"
              >
                {formatScore(profile.overall)}%
              </motion.p>
              <p className="mt-1 text-sm text-slate-600">{t("result.readiness")}</p>
              <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                {t(`result.bands.${profile.overallBand}`)}
              </p>
              <p className="mt-3 text-xs text-slate-500">{setupLine}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label={t("result.monthly")}
                value={money(profile.costs.recommendedMonthly)}
              />
              <StatCard
                label={t("result.yearly")}
                value={money(profile.costs.yearlyForecast)}
              />
              <StatCard
                label={t("result.oneTime")}
                value={money(profile.costs.oneTimeTotal)}
              />
            </div>
            <p className="text-center text-xs text-slate-500">{t("result.note")}</p>

            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="label-caption mb-4 text-slate-400">
                {t("result.breakdown")}
              </p>
              <div className="space-y-2 text-sm">
                <Row
                  label={t("costs.monthlyTotal")}
                  value={money(profile.costs.monthlyTotal)}
                />
                <Row
                  label={t("costs.annualTotal")}
                  value={money(profile.costs.annualTotal)}
                />
                <Row
                  label={t("costs.oneTimeTotal")}
                  value={money(profile.costs.oneTimeTotal)}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="label-caption mb-4 text-slate-400">
                {t("result.dimensions")}
              </p>
              <div className="space-y-4">
                {profile.dimensions.map((dim) => (
                  <div key={dim.dimension}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-800">
                        {t(`result.dimensionLabels.${dim.dimension}`)}
                      </span>
                      <span className="font-mono text-slate-600">
                        {formatScore(dim.score)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-orange-600"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {t(`result.bands.${dim.band}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-amber-100">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb
                  className="h-4 w-4 text-amber-500"
                  strokeWidth={ICON_STROKE_WIDTH}
                />
                <p className="label-caption text-amber-600">
                  {t("result.insights")}
                </p>
              </div>
              <ul className="space-y-3">
                {visibleInsights.map((id) => (
                  <li
                    key={id}
                    className="rounded-xl bg-amber-50/60 px-3.5 py-3 text-sm leading-relaxed text-slate-800"
                  >
                    {t(`insights.${id}`)}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn-secondary mt-4 inline-flex items-center gap-2"
                onClick={() =>
                  setInsightOffset(
                    (prev) => (prev + 1) % profile.insightIds.length,
                  )
                }
              >
                <Sparkles className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                {t("actions.newInsight")}
              </button>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="label-caption mb-3 text-slate-400">{t("result.tips")}</p>
              <ul className="space-y-2">
                {profile.tipIds.map((id) => (
                  <li
                    key={id}
                    className="rounded-xl bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-100"
                  >
                    {t(`tips.${id}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-100">
              <p className="label-caption mb-3 text-slate-400">
                {t("result.cardTitle")}
              </p>
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-5 ring-1 ring-orange-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {brandName}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {profileLabel}
                </p>
                <p className="mt-1 text-xs text-slate-500">{setupLine}</p>
                <p className="mt-3 text-base font-semibold text-orange-800">
                  {money(profile.costs.recommendedMonthly)}
                  <span className="ms-1 text-sm font-normal text-slate-500">
                    / {t("result.monthly")}
                  </span>
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  {money(profile.costs.yearlyForecast)} · {t("result.yearly")}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-700">
                  {primaryInsight}
                </p>
                <p className="mt-4 text-xs text-slate-400">
                  {t("result.cardFooter")}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
                  disabled={cardBusy}
                  onClick={() => void handleDownloadCard()}
                >
                  <Download className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                  {t("actions.downloadCard")}
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
                  disabled={cardBusy}
                  onClick={() => void handleCopyCard()}
                >
                  <Share2 className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                  {t("actions.copyCard")}
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2"
                  onClick={() => void copyText()}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" strokeWidth={ICON_STROKE_WIDTH} />
                  ) : (
                    <Share2 className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                  )}
                  {copied ? t("actions.copied") : t("actions.copyText")}
                </button>
              </div>
              {cardStatus && (
                <p className="mt-2 text-sm text-emerald-600">{cardStatus}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                onClick={() => void nativeShare()}
              >
                <Share2 className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                {t("actions.share")}
              </button>
              <button type="button" className="btn-secondary" onClick={restart}>
                {t("actions.restart")}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPhase("setup")}
              >
                {t("actions.changeSetup")}
              </button>
            </div>

            <CalculationSavePanel
              toolSlug="dog-ownership-calculator"
              saveName={saveName}
              onSaveNameChange={setSaveName}
              inputs={{
                setup: profile.setup,
                answers,
                overall: profile.overall,
                overallBand: profile.overallBand,
                profileId: profile.profileId,
                costs: profile.costs,
                recommendedMonthly: profile.costs.recommendedMonthly,
                yearlyForecast: profile.costs.yearlyForecast,
                oneTimeTotal: profile.costs.oneTimeTotal,
                dimensions: profile.dimensions,
                insightIds: profile.insightIds,
                tipIds: profile.tipIds,
              }}
              resultSummary={t("result.resultSummary", {
                profile: profileLabel,
                monthly: formatMoney(profile.costs.recommendedMonthly),
                yearly: formatMoney(profile.costs.yearlyForecast),
                symbol: currencySymbol,
                score: formatScore(profile.overall),
              })}
            />

            <Link
              href={toolsPath}
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-700 hover:text-orange-800"
            >
              {t("actions.backToTools")}
              <ArrowRight
                className="h-4 w-4 rtl:rotate-180"
                strokeWidth={ICON_STROKE_WIDTH}
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SetupGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-5">
      <p className="label-caption mb-2 text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ChoiceChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm transition ${
        selected
          ? "bg-orange-800 font-semibold text-white shadow-sm"
          : "bg-slate-50 text-slate-700 ring-1 ring-slate-100 hover:bg-orange-50 hover:text-orange-800"
      }`}
    >
      {label}
    </button>
  );
}

function CostSection({
  title,
  totalLabel,
  total,
  lines,
  t,
  money,
}: {
  title: string;
  totalLabel: string;
  total: string;
  lines: { id: string; amount: number }[];
  t: (key: string) => string;
  money: (amount: number) => string;
}) {
  return (
    <div className="mt-5 rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-100">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex items-center justify-between gap-3 text-sm text-slate-700"
          >
            <span>{t(`costs.lines.${line.id}`)}</span>
            <span className="shrink-0 font-mono text-slate-600">
              {money(line.amount)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 pt-2 text-sm font-semibold text-slate-900">
        <span>{totalLabel}</span>
        <span className="font-mono">{total}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-md ring-1 ring-orange-50">
      <p className="label-caption text-slate-400">{label}</p>
      <p className="mt-2 font-mono text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
      <span className="text-slate-600">{label}</span>
      <span className="font-mono font-semibold text-slate-900">{value}</span>
    </div>
  );
}
