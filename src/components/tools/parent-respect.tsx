"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  HeartHandshake,
  Lightbulb,
  Share2,
  Sparkles,
  Users,
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
  analyzeParentRespect,
  copyParentCardImage,
  downloadParentCard,
  getParentQuestionsForMode,
  isParentSetupComplete,
  type ContactPattern,
  type LikertValue,
  type LivingDistance,
  type ParentAnswers,
  type ParentMode,
  type ParentProfile,
  type ParentSetup,
  type ParentStage,
} from "@/lib/parent-respect";
import { easeOut, springSnappy } from "@/lib/motion-presets";
import { answerOptionLabel } from "@/lib/quiz-option-label";
import { ICON_STROKE_WIDTH } from "@/lib/tool-icons";

type Phase = "setup" | "mode" | "quiz" | "result";

const LIKERT: LikertValue[] = [1, 2, 3, 4, 5];
const DEFAULT_SETUP: Partial<ParentSetup> = {};

function formatScore(score: number): string {
  return score.toFixed(1);
}

function questionPrompt(
  t: (key: string, options?: Record<string, unknown>) => string,
  questionId: string,
  setup: ParentSetup,
  distanceAware?: boolean,
  stageAware?: boolean,
): string {
  if (distanceAware) {
    const key = `questions.${questionId}.byDistance.${setup.distance}`;
    const tailored = t(key);
    if (tailored !== key) return tailored;
  }
  if (stageAware) {
    const key = `questions.${questionId}.byStage.${setup.stage}`;
    const tailored = t(key);
    if (tailored !== key) return tailored;
  }
  return t(`questions.${questionId}.prompt`);
}

export function ParentRespectCalculator() {
  const { t } = useToolTranslation("parent-respect-calculator");
  const { t: tCommon } = useTranslation("common");
  const localizePath = useLocalizedPath();
  const toolsPath = localizePath("/tools");
  const dir = useLocaleDirection();
  const rtl = dir === "rtl";
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const NextIcon = rtl ? ArrowLeft : ArrowRight;

  const [setup, setSetup] = useLocalStorage<Partial<ParentSetup>>(
    "tool:parent-respect:setup",
    DEFAULT_SETUP,
  );
  const [mode, setMode] = useLocalStorage<ParentMode>(
    "tool:parent-respect:mode",
    "quick",
  );
  const [answers, setAnswers] = useLocalStorage<ParentAnswers>(
    "tool:parent-respect:answers",
    {},
  );
  const [phase, setPhase] = useState<Phase>("setup");
  const [index, setIndex] = useState(0);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [insightOffset, setInsightOffset] = useState(0);
  const [saveName, setSaveName] = useState("");
  const [copied, setCopied] = useState(false);
  const [cardStatus, setCardStatus] = useState<string | null>(null);
  const [cardBusy, setCardBusy] = useState(false);

  const questions = useMemo(() => getParentQuestionsForMode(mode), [mode]);
  const current = questions[index];
  const total = questions.length;
  const quizProgress = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;
  const brandName = tCommon("app.name");
  const setupReady = isParentSetupComplete(setup);

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
      t(`setup.distance.${setup.distance}`),
      t(`setup.contact.${setup.contact}`),
      t(`setup.stage.${setup.stage}`),
    ].join(" · ");
  }, [setup, setupReady, t]);

  const handleRestore = useCallback(
    (entry: CalculationHistoryEntry) => {
      const restoredSetup = (entry.inputs.setup as ParentSetup) ?? null;
      const restoredMode =
        (entry.inputs.mode as ParentMode) === "full" ? "full" : "quick";
      const restoredAnswers = (entry.inputs.answers as ParentAnswers) ?? {};
      if (restoredSetup && isParentSetupComplete(restoredSetup)) {
        setSetup(restoredSetup);
      }
      setMode(restoredMode);
      setAnswers(restoredAnswers);
      setSaveName(entry.name);
      if (restoredSetup && isParentSetupComplete(restoredSetup)) {
        const analyzed = analyzeParentRespect(
          restoredMode,
          restoredSetup,
          restoredAnswers,
        );
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
        setPhase("mode");
      }
    },
    [setSetup, setMode, setAnswers],
  );

  useCalculationRestore("parent-respect-calculator", handleRestore);

  const patchSetup = <K extends keyof ParentSetup>(
    key: K,
    value: ParentSetup[K],
  ) => {
    setSetup((prev) => ({ ...prev, [key]: value }));
  };

  const startQuiz = (nextMode: ParentMode) => {
    if (!setupReady) return;
    setMode(nextMode);
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
      const analyzed = analyzeParentRespect(mode, setup, {
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
      setPhase("mode");
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
      profile: profileLabel,
      score: formatScore(profile.overall),
      insight: primaryInsight,
    });
  }, [profile, profileLabel, primaryInsight, t]);

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
      scoreLabel: t("result.overall"),
      scoreText: `${formatScore(profile.overall)}%`,
      setupLine,
      dimensions: profile.dimensions.map((dim) => ({
        label: t(`result.dimensionLabels.${dim.dimension}`),
        score: `${formatScore(dim.score)}%`,
      })),
      insight: primaryInsight,
      footer: t("result.cardFooter"),
      rtl,
    };
  }, [profile, brandName, profileLabel, setupLine, primaryInsight, t, rtl]);

  const handleDownloadCard = async () => {
    if (!sharePayload) return;
    setCardBusy(true);
    try {
      await downloadParentCard(sharePayload);
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
      const ok = await copyParentCardImage(sharePayload);
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
      <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-white to-teal-50 p-5 shadow-md ring-1 ring-sky-100/80 sm:p-6">
        <p className="label-caption mb-2 text-teal-700/80">{t("intro.eyebrow")}</p>
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

              <SetupGroup label={t("setup.distanceLabel")}>
                {(["sameArea", "shortDrive", "farAway"] as LivingDistance[]).map(
                  (value) => (
                    <ChoiceChip
                      key={value}
                      selected={setup.distance === value}
                      onClick={() => patchSetup("distance", value)}
                      label={t(`setup.distance.${value}`)}
                    />
                  ),
                )}
              </SetupGroup>

              <SetupGroup label={t("setup.contactLabel")}>
                {(
                  [
                    "daily",
                    "fewWeekly",
                    "weekends",
                    "mostlyPhone",
                  ] as ContactPattern[]
                ).map((value) => (
                  <ChoiceChip
                    key={value}
                    selected={setup.contact === value}
                    onClick={() => patchSetup("contact", value)}
                    label={t(`setup.contact.${value}`)}
                  />
                ))}
              </SetupGroup>

              <SetupGroup label={t("setup.stageLabel")}>
                {(
                  ["independent", "someHelp", "caregiving"] as ParentStage[]
                ).map((value) => (
                  <ChoiceChip
                    key={value}
                    selected={setup.stage === value}
                    onClick={() => patchSetup("stage", value)}
                    label={t(`setup.stage.${value}`)}
                  />
                ))}
              </SetupGroup>
            </div>

            <button
              type="button"
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={!setupReady}
              onClick={() => setPhase("mode")}
            >
              {t("setup.continue")}
            </button>
          </motion.div>
        )}

        {phase === "mode" && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={easeOut}
            className="space-y-4"
          >
            {setupReady && (
              <p className="text-center text-sm text-slate-500">{setupLine}</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <ModeCard
                title={t("modes.quick")}
                meta={t("modes.quickMeta")}
                onClick={() => startQuiz("quick")}
                icon={<Users className="h-5 w-5" strokeWidth={ICON_STROKE_WIDTH} />}
              />
              <ModeCard
                title={t("modes.full")}
                meta={t("modes.fullMeta")}
                onClick={() => startQuiz("full")}
                icon={
                  <HeartHandshake
                    className="h-5 w-5"
                    strokeWidth={ICON_STROKE_WIDTH}
                  />
                }
              />
            </div>
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-2"
              onClick={() => setPhase("setup")}
            >
              <BackIcon className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
              {t("modes.backToSetup")}
            </button>
          </motion.div>
        )}

        {phase === "quiz" && current && setupReady && (
          <motion.div
            key={`quiz-${mode}-${current.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={easeOut}
            className="space-y-5"
          >
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  {t("progress.label", { current: index + 1, total })}
                </span>
                <span>{t("progress.percent", { percent: quizProgress })}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-teal-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${quizProgress}%` }}
                  transition={springSnappy}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
              <p className="label-caption mb-3 text-teal-700">
                {t(`result.dimensionLabels.${current.dimension}`)}
              </p>
              <p className="text-lg font-medium leading-relaxed text-slate-900">
                {questionPrompt(
                  t,
                  current.id,
                  setup,
                  current.distanceAware,
                  current.stageAware,
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
                          ? "bg-teal-800 font-semibold text-white ring-teal-800"
                          : "bg-slate-50 text-slate-700 ring-slate-100 hover:bg-white hover:ring-teal-200"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          selected
                            ? "bg-white text-teal-800"
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
            <div className="rounded-2xl border-2 border-teal-100 bg-gradient-to-br from-sky-50/80 via-white to-teal-50 px-6 py-8 text-center shadow-md">
              <p className="label-caption mb-2 text-slate-500">
                {t("result.caption")}
              </p>
              <p className="text-lg font-bold text-slate-900">{profileLabel}</p>
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springSnappy}
                className="mt-3 font-mono text-5xl font-bold text-teal-800 sm:text-6xl"
              >
                {formatScore(profile.overall)}%
              </motion.p>
              <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                {t(`result.bands.${profile.overallBand}`)}
              </p>
              <p className="mt-3 text-xs text-slate-500">{setupLine}</p>
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
                        className="h-full rounded-full bg-teal-600"
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
              <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-white to-teal-50 p-5 ring-1 ring-teal-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {brandName}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {profileLabel}
                </p>
                <p className="mt-1 text-xs text-slate-500">{setupLine}</p>
                <p className="mt-3 font-mono text-4xl font-bold text-teal-800">
                  {formatScore(profile.overall)}%
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
                onClick={() => setPhase("mode")}
              >
                {t("actions.changeMode")}
              </button>
            </div>

            <CalculationSavePanel
              toolSlug="parent-respect-calculator"
              saveName={saveName}
              onSaveNameChange={setSaveName}
              inputs={{
                mode: profile.mode,
                setup: profile.setup,
                answers,
                overall: profile.overall,
                overallBand: profile.overallBand,
                profileId: profile.profileId,
                dimensions: profile.dimensions,
                insightIds: profile.insightIds,
                tipIds: profile.tipIds,
              }}
              resultSummary={t("result.resultSummary", {
                profile: profileLabel,
                score: formatScore(profile.overall),
                mode: t(`modes.${profile.mode}`),
              })}
            />

            <Link
              href={toolsPath}
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
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
          ? "bg-teal-800 font-semibold text-white shadow-sm"
          : "bg-slate-50 text-slate-700 ring-1 ring-slate-100 hover:bg-teal-50 hover:text-teal-800"
      }`}
    >
      {label}
    </button>
  );
}

function ModeCard({
  title,
  meta,
  onClick,
  icon,
}: {
  title: string;
  meta: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl bg-white p-5 text-start shadow-md ring-1 ring-slate-100 transition hover:ring-teal-200"
    >
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        {icon}
      </span>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{meta}</p>
    </button>
  );
}
