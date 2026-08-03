"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Download,
  Heart,
  Lightbulb,
  RefreshCw,
  Share2,
  Sparkles,
} from "lucide-react";
import { CalculationSavePanel } from "@/components/tools/calculation-save-panel";
import { useCalculationRestore } from "@/hooks/use-calculation-restore";
import { usePrivateToolStats } from "@/hooks/use-private-tool-stats";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLocalizedPath } from "@/hooks/use-localized-path";
import { useToolTranslation } from "@/hooks/use-tool-translation";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";
import {
  LOVE_INPUT_CATEGORY_ORDER,
  LOVE_INPUTS,
  LOVE_MOODS,
  computeMatchup,
  computeSynergy,
  computeWeeklyReport,
  copyShareCardImage,
  downloadShareCard,
  getTimeOfDay,
  pickInsightId,
  pickMatchupInsightId,
  pickTimeNoteId,
  type CalculatorMode,
  type LoveInputCategoryId,
  type MatchupResult,
  type SynergyResult,
  type TimeOfDay,
  type WeeklyReportResult,
} from "@/lib/love-calculator";
import { useTranslation } from "@/lib/i18n/provider";
import { easeOut, springSnappy } from "@/lib/motion-presets";
import { ICON_STROKE_WIDTH } from "@/lib/tool-icons";

type Phase = "pick" | "computing" | "result";
type PickerSlot = "joy" | "vice" | "left" | "right" | "weekly" | null;

function formatScore(score: number): string {
  return score.toFixed(1);
}

function readSteps(
  t: (key: string, options?: Record<string, unknown>) => string,
  key: string,
  fallback: string[],
): string[] {
  const raw = t(key, { returnObjects: true });
  return Array.isArray(raw) ? (raw as string[]) : fallback;
}

export function LoveCalculator() {
  const { t, tc } = useToolTranslation("love-calculator");
  const { t: tCommon } = useTranslation("common");
  const localizePath = useLocalizedPath();
  const toolsPath = localizePath("/tools");
  const dir = useLocaleDirection();
  const rtl = dir === "rtl";

  const [mode, setMode] = useLocalStorage<CalculatorMode>(
    "tool:love-calculator:mode",
    "classic",
  );
  const [joyId, setJoyId] = useLocalStorage<string | null>(
    "tool:love-calculator:joy",
    null,
  );
  const [viceId, setViceId] = useLocalStorage<string | null>(
    "tool:love-calculator:vice",
    null,
  );
  const [moodId, setMoodId] = useLocalStorage<string | null>(
    "tool:love-calculator:mood",
    null,
  );
  const [leftId, setLeftId] = useLocalStorage<string | null>(
    "tool:love-calculator:left",
    null,
  );
  const [rightId, setRightId] = useLocalStorage<string | null>(
    "tool:love-calculator:right",
    null,
  );
  const [weeklyIds, setWeeklyIds] = useLocalStorage<string[]>(
    "tool:love-calculator:weekly",
    [],
  );
  const [activeCategory, setActiveCategory] =
    useLocalStorage<LoveInputCategoryId>(
      "tool:love-calculator:category",
      "food",
    );

  const [picker, setPicker] = useState<PickerSlot>("joy");
  const [phase, setPhase] = useState<Phase>("pick");
  const [computingStep, setComputingStep] = useState(0);
  const [synergy, setSynergy] = useState<SynergyResult | null>(null);
  const [matchup, setMatchup] = useState<MatchupResult | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReportResult | null>(null);
  const [insightId, setInsightId] = useState<string | null>(null);
  const [usedInsights, setUsedInsights] = useState<string[]>([]);
  const [insightSalt, setInsightSalt] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [timeNoteId, setTimeNoteId] = useState("morning-1");
  const [saveName, setSaveName] = useState("");
  const [copied, setCopied] = useState(false);
  const [cardStatus, setCardStatus] = useState<string | null>(null);
  const [deepMode, setDeepMode] = useState(false);
  const [cardBusy, setCardBusy] = useState(false);

  useEffect(() => {
    const tod = getTimeOfDay();
    setTimeOfDay(tod);
    setTimeNoteId(pickTimeNoteId(tod, Date.now() % 97));
  }, []);

  useEffect(() => {
    setPhase("pick");
    setSynergy(null);
    setMatchup(null);
    setWeekly(null);
    setInsightId(null);
    setUsedInsights([]);
    setDeepMode(false);
    if (mode === "classic") setPicker("joy");
    else if (mode === "matchup") setPicker("left");
    else setPicker("weekly");
  }, [mode]);

  const computeSteps = useMemo(() => {
    if (mode === "matchup") {
      return readSteps(t, "computing.matchupSteps", [
        "Comparing…",
        "Friction…",
        "Chemistry…",
        "Insight…",
      ]);
    }
    if (mode === "weekly") {
      return readSteps(t, "computing.weeklySteps", [
        "Collecting…",
        "Diagnosing…",
        "Headline…",
        "Sealing…",
      ]);
    }
    return readSteps(t, "computing.steps", [
      "Scanning…",
      "Cross-checking…",
      "Tuning mood…",
      "Computing…",
    ]);
  }, [mode, t]);

  const categoryItems = useMemo(
    () => LOVE_INPUTS.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  const canCalculate = useMemo(() => {
    if (mode === "classic") return Boolean(joyId && viceId && moodId);
    if (mode === "matchup") return Boolean(leftId && rightId && leftId !== rightId);
    return weeklyIds.length === 3 && new Set(weeklyIds).size === 3;
  }, [mode, joyId, viceId, moodId, leftId, rightId, weeklyIds]);

  const timeNote = t(`time.notes.${timeNoteId}`);

  const classicInsight = useMemo(() => {
    if (!synergy || !insightId || !joyId || !viceId || !moodId) return "";
    return t(`insights.templates.${insightId}`, {
      joy: t(`inputs.${joyId}`),
      vice: t(`inputs.${viceId}`),
      mood: t(`moods.${moodId}`),
      score: formatScore(synergy.score),
      bandLabel: t(`result.band.${synergy.band}`),
      timeNote,
    });
  }, [synergy, insightId, joyId, viceId, moodId, t, timeNote]);

  const matchupInsight = useMemo(() => {
    if (!matchup || !insightId || !leftId || !rightId) return "";
    return t(`matchup.insights.${insightId}`, {
      left: t(`inputs.${leftId}`),
      right: t(`inputs.${rightId}`),
      score: formatScore(matchup.score),
      friction: formatScore(matchup.friction),
    });
  }, [matchup, insightId, leftId, rightId, t]);

  const weeklyTitle = weekly ? t(`weekly.titles.${weekly.titleId}`) : "";
  const weeklySummary = useMemo(() => {
    if (!weekly || weeklyIds.length !== 3) return "";
    return t(`weekly.summaries.${weekly.summaryId}`, {
      a: t(`inputs.${weeklyIds[0]}`),
      b: t(`inputs.${weeklyIds[1]}`),
      c: t(`inputs.${weeklyIds[2]}`),
      score: formatScore(weekly.score),
      bandLabel: t(`result.band.${weekly.band}`),
    });
  }, [weekly, weeklyIds, t]);

  const displayInsight =
    mode === "classic"
      ? classicInsight
      : mode === "matchup"
        ? matchupInsight
        : weeklySummary;

  const displayScore =
    mode === "classic"
      ? synergy?.score
      : mode === "matchup"
        ? matchup?.score
        : weekly?.score;

  const displayBand =
    mode === "classic"
      ? synergy?.band
      : mode === "matchup"
        ? matchup?.band
        : weekly?.band;

  const brandName = tCommon("app.name");

  const sharePayload = useMemo(() => {
    if (mode === "classic" && synergy && classicInsight) {
      return t("result.shareText", {
        score: formatScore(synergy.score),
        insight: classicInsight,
      });
    }
    if (mode === "matchup" && matchup && leftId && rightId && matchupInsight) {
      return t("matchup.shareText", {
        left: t(`inputs.${leftId}`),
        right: t(`inputs.${rightId}`),
        score: formatScore(matchup.score),
        friction: formatScore(matchup.friction),
        insight: matchupInsight,
      });
    }
    if (mode === "weekly" && weekly && weeklySummary) {
      return t("weekly.shareText", {
        title: weeklyTitle,
        score: formatScore(weekly.score),
        summary: weeklySummary,
      });
    }
    return "";
  }, [
    mode,
    synergy,
    classicInsight,
    matchup,
    leftId,
    rightId,
    matchupInsight,
    weekly,
    weeklySummary,
    weeklyTitle,
    t,
  ]);

  const cardTitle =
    mode === "weekly"
      ? weeklyTitle
      : mode === "matchup"
        ? t("modes.matchup")
        : t("result.caption");

  const cardScoreText =
    displayScore !== undefined ? `${formatScore(displayScore)}%` : "";

  const cardBadge =
    mode === "matchup" && matchup
      ? t(`matchup.relation.${matchup.relation}`)
      : displayBand
        ? t(`result.band.${displayBand}`)
        : undefined;

  const handleRestore = useCallback(
    (entry: CalculationHistoryEntry) => {
      const restoredMode = (entry.inputs.mode as CalculatorMode) || "classic";
      setMode(restoredMode);
      setSaveName(entry.name);

      if (restoredMode === "matchup") {
        setLeftId((entry.inputs.leftId as string) ?? null);
        setRightId((entry.inputs.rightId as string) ?? null);
        if (entry.inputs.leftId && entry.inputs.rightId) {
          const result = computeMatchup(
            String(entry.inputs.leftId),
            String(entry.inputs.rightId),
          );
          if (result) {
            setMatchup(result);
            const id =
              typeof entry.inputs.insightId === "string"
                ? entry.inputs.insightId
                : pickMatchupInsightId(
                    String(entry.inputs.leftId),
                    String(entry.inputs.rightId),
                    result.relation,
                  );
            setInsightId(id);
            setUsedInsights([id]);
            setPhase("result");
          }
        }
        return;
      }

      if (restoredMode === "weekly") {
        const ids = Array.isArray(entry.inputs.weeklyIds)
          ? (entry.inputs.weeklyIds as string[])
          : [];
        setWeeklyIds(ids);
        if (ids.length === 3) {
          const result = computeWeeklyReport(ids as [string, string, string]);
          if (result) {
            setWeekly(result);
            setInsightId(result.summaryId);
            setPhase("result");
          }
        }
        return;
      }

      setJoyId((entry.inputs.joyId as string) ?? null);
      setViceId((entry.inputs.viceId as string) ?? null);
      setMoodId((entry.inputs.moodId as string) ?? null);
      if (entry.inputs.joyId && entry.inputs.viceId && entry.inputs.moodId) {
        const result = computeSynergy({
          joyId: String(entry.inputs.joyId),
          viceId: String(entry.inputs.viceId),
          moodId: String(entry.inputs.moodId),
        });
        if (result) {
          setSynergy(result);
          const restoredInsight =
            typeof entry.inputs.insightId === "string"
              ? entry.inputs.insightId
              : pickInsightId(
                  {
                    joyId: String(entry.inputs.joyId),
                    viceId: String(entry.inputs.viceId),
                    moodId: String(entry.inputs.moodId),
                  },
                  result.band,
                  [],
                  0,
                  getTimeOfDay(),
                );
          setInsightId(restoredInsight);
          setUsedInsights([restoredInsight]);
          setPhase("result");
        }
      }
    },
    [
      setMode,
      setLeftId,
      setRightId,
      setWeeklyIds,
      setJoyId,
      setViceId,
      setMoodId,
    ],
  );

  useCalculationRestore("love-calculator", handleRestore);

  const { trackStart, trackAnswer, trackComplete } =
    usePrivateToolStats("love-calculator");

  useEffect(() => {
    if (phase !== "computing") return;
    setComputingStep(0);
    const timers: number[] = [];
    const stepMs = 480;
    for (let i = 1; i < computeSteps.length; i += 1) {
      timers.push(window.setTimeout(() => setComputingStep(i), stepMs * i));
    }
    timers.push(
      window.setTimeout(() => {
        if (mode === "classic") {
          if (!joyId || !viceId || !moodId) {
            setPhase("pick");
            return;
          }
          const result = computeSynergy({ joyId, viceId, moodId });
          if (!result) {
            setPhase("pick");
            return;
          }
          const firstInsight = pickInsightId(
            { joyId, viceId, moodId },
            result.band,
            [],
            0,
            timeOfDay,
          );
          setSynergy(result);
          setMatchup(null);
          setWeekly(null);
          setInsightId(firstInsight);
          setUsedInsights([firstInsight]);
          setInsightSalt(0);
          setDeepMode(false);
          setPhase("result");
          trackComplete({ mode, outcome: result.band });
          return;
        }

        if (mode === "matchup") {
          if (!leftId || !rightId) {
            setPhase("pick");
            return;
          }
          const result = computeMatchup(leftId, rightId);
          if (!result) {
            setPhase("pick");
            return;
          }
          const firstInsight = pickMatchupInsightId(
            leftId,
            rightId,
            result.relation,
          );
          setMatchup(result);
          setSynergy(null);
          setWeekly(null);
          setInsightId(firstInsight);
          setUsedInsights([firstInsight]);
          setInsightSalt(0);
          setPhase("result");
          trackComplete({ mode, outcome: result.relation });
          return;
        }

        if (weeklyIds.length !== 3) {
          setPhase("pick");
          return;
        }
        const result = computeWeeklyReport(
          weeklyIds as [string, string, string],
        );
        if (!result) {
          setPhase("pick");
          return;
        }
        setWeekly(result);
        setSynergy(null);
        setMatchup(null);
        setInsightId(result.summaryId);
        setUsedInsights([result.summaryId]);
        setInsightSalt(0);
        setPhase("result");
        trackComplete({ mode, outcome: result.summaryId });
      }, stepMs * computeSteps.length + 180),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [
    phase,
    mode,
    joyId,
    viceId,
    moodId,
    leftId,
    rightId,
    weeklyIds,
    computeSteps.length,
    timeOfDay,
    trackComplete,
  ]);

  const selectInput = (id: string) => {
    if (picker === "joy") {
      setJoyId(id);
      setPicker(viceId ? null : "vice");
    } else if (picker === "vice") {
      setViceId(id);
      setPicker(null);
    } else if (picker === "left") {
      setLeftId(id);
      setPicker(rightId ? null : "right");
    } else if (picker === "right") {
      setRightId(id);
      setPicker(null);
    } else if (picker === "weekly") {
      setWeeklyIds((prev) => {
        if (prev.includes(id)) return prev.filter((item) => item !== id);
        if (prev.length >= 3) return prev;
        return [...prev, id];
      });
    }
  };

  const runCalculate = () => {
    if (!canCalculate) return;
    trackStart({ mode });
    if (mode === "classic" && joyId && viceId && moodId) {
      trackAnswer("joy", joyId);
      trackAnswer("vice", viceId);
      trackAnswer("mood", moodId);
    } else if (mode === "matchup" && leftId && rightId) {
      trackAnswer("left", leftId);
      trackAnswer("right", rightId);
    } else if (mode === "weekly") {
      weeklyIds.forEach((id, index) => {
        trackAnswer(`weekly-${index + 1}`, id);
      });
    }
    setPhase("computing");
  };

  const refreshInsight = (deep: boolean) => {
    if (mode === "classic") {
      if (!synergy || !joyId || !viceId || !moodId) return;
      const nextSalt = insightSalt + 1;
      setInsightSalt(nextSalt);
      setDeepMode(deep);
      const exclude = usedInsights.slice(-10);
      const selection = { joyId, viceId, moodId };
      let next: string;
      if (deep) {
        const deepPool = [
          "deep-dive-synergy",
          "deep-dive-tension",
          "deep-dive-balance",
          "deep-dive-ops",
        ].filter((id) => !exclude.includes(id));
        next =
          deepPool[nextSalt % Math.max(deepPool.length, 1)] ??
          pickInsightId(selection, synergy.band, exclude, nextSalt + 99, timeOfDay);
      } else {
        next = pickInsightId(
          selection,
          synergy.band,
          exclude,
          nextSalt,
          timeOfDay,
        );
      }
      setInsightId(next);
      setUsedInsights((prev) => [...prev, next]);
      setTimeNoteId(pickTimeNoteId(timeOfDay, nextSalt));
      return;
    }

    if (mode === "matchup" && matchup && leftId && rightId) {
      const nextSalt = insightSalt + 1;
      setInsightSalt(nextSalt);
      const next = pickMatchupInsightId(
        leftId,
        rightId,
        matchup.relation,
        usedInsights.slice(-8),
        nextSalt,
      );
      setInsightId(next);
      setUsedInsights((prev) => [...prev, next]);
      return;
    }

    if (mode === "weekly" && weekly && weeklyIds.length === 3) {
      const nextSalt = insightSalt + 1;
      setInsightSalt(nextSalt);
      const alt = computeWeeklyReport(
        weeklyIds as [string, string, string],
        nextSalt,
      );
      if (!alt) return;
      setWeekly(alt);
      setInsightId(alt.summaryId);
      setUsedInsights((prev) => [...prev, alt.summaryId]);
    }
  };

  const handleClear = () => {
    if (mode === "classic") {
      setJoyId(null);
      setViceId(null);
      setMoodId(null);
      setPicker("joy");
    } else if (mode === "matchup") {
      setLeftId(null);
      setRightId(null);
      setPicker("left");
    } else {
      setWeeklyIds([]);
      setPicker("weekly");
    }
    setPhase("pick");
    setSynergy(null);
    setMatchup(null);
    setWeekly(null);
    setInsightId(null);
    setUsedInsights([]);
    setSaveName("");
    setDeepMode(false);
    setCardStatus(null);
  };

  const copyShare = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(`${sharePayload}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const nativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      await copyShare();
      return;
    }
    try {
      await navigator.share({
        title: t("intro.title"),
        text: sharePayload,
        url: window.location.href,
      });
    } catch {
      // cancelled
    }
  };

  const handleDownloadCard = async () => {
    if (!displayInsight || !cardScoreText) return;
    setCardBusy(true);
    try {
      await downloadShareCard({
        brand: brandName,
        title: cardTitle,
        scoreLabel:
          mode === "weekly"
            ? t("weekly.scoreCaption")
            : mode === "matchup"
              ? t("matchup.scoreCaption")
              : t("result.caption"),
        scoreText: cardScoreText,
        badge: cardBadge,
        insight: displayInsight,
        footer: t("card.footer"),
        rtl,
      });
      setCardStatus(t("card.saved"));
      window.setTimeout(() => setCardStatus(null), 1800);
    } finally {
      setCardBusy(false);
    }
  };

  const handleCopyCard = async () => {
    if (!displayInsight || !cardScoreText) return;
    setCardBusy(true);
    try {
      const ok = await copyShareCardImage({
        brand: brandName,
        title: cardTitle,
        scoreLabel:
          mode === "weekly"
            ? t("weekly.scoreCaption")
            : mode === "matchup"
              ? t("matchup.scoreCaption")
              : t("result.caption"),
        scoreText: cardScoreText,
        badge: cardBadge,
        insight: displayInsight,
        footer: t("card.footer"),
        rtl,
      });
      setCardStatus(ok ? t("card.imageCopied") : t("card.imageCopyFailed"));
      if (!ok) await handleDownloadCard();
      window.setTimeout(() => setCardStatus(null), 1800);
    } finally {
      setCardBusy(false);
    }
  };

  const hasInput =
    mode === "classic"
      ? Boolean(joyId || viceId || moodId)
      : mode === "matchup"
        ? Boolean(leftId || rightId)
        : weeklyIds.length > 0;

  const modes: CalculatorMode[] = ["classic", "matchup", "weekly"];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-md ring-1 ring-rose-100/80 sm:p-6">
        <p className="label-caption mb-2 text-rose-500">{t("intro.eyebrow")}</p>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {t("intro.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
          {t("intro.body")}
        </p>
        <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-600 ring-1 ring-rose-100">
          {t(`time.greeting.${timeOfDay}`)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-md">
        {modes.map((item) => {
          const active = mode === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition min-w-[7.5rem] ${
                active
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
              }`}
            >
              {t(`modes.${item}`)}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {phase === "computing" ? (
          <motion.div
            key="computing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={easeOut}
            className="rounded-2xl bg-white px-6 py-14 text-center shadow-md"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500"
            >
              <Heart className="h-7 w-7" strokeWidth={ICON_STROKE_WIDTH} />
            </motion.div>
            <p className="label-caption mb-2 text-rose-500">
              {t("actions.calculating")}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={computingStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-lg font-medium text-slate-800"
              >
                {computeSteps[computingStep] ?? computeSteps[0]}
              </motion.p>
            </AnimatePresence>
            <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-rose-400"
                initial={{ width: "8%" }}
                animate={{
                  width: `${((computingStep + 1) / computeSteps.length) * 100}%`,
                }}
                transition={springSnappy}
              />
            </div>
          </motion.div>
        ) : phase === "result" && displayScore !== undefined ? (
          <motion.div
            key={`result-${mode}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={easeOut}
            className="space-y-4"
          >
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-6 py-8 text-center shadow-md">
              <p className="label-caption mb-2 text-rose-600">
                {mode === "weekly"
                  ? t("weekly.reportCaption")
                  : mode === "matchup"
                    ? t("matchup.scoreCaption")
                    : t("result.caption")}
              </p>
              {mode === "weekly" && (
                <p className="mb-3 text-lg font-bold text-slate-900">
                  {weeklyTitle}
                </p>
              )}
              <motion.p
                key={displayScore}
                initial={{ scale: 0.86, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springSnappy}
                className="font-mono text-5xl font-bold text-rose-600 sm:text-6xl"
              >
                {formatScore(displayScore)}%
              </motion.p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {cardBadge}
              </p>
              {mode === "matchup" && matchup && (
                <p className="mt-3 text-sm text-rose-800/80">
                  {t("matchup.frictionCaption")}: {formatScore(matchup.friction)}%
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="label-caption mb-3 text-slate-400">
                {t("result.comboCaption")}
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                {mode === "classic" && (
                  <>
                    <li className="flex flex-wrap gap-x-2">
                      <span className="font-medium text-slate-500">
                        {t("steps.joy")}
                      </span>
                      <span>{joyId ? t(`inputs.${joyId}`) : "—"}</span>
                    </li>
                    <li className="flex flex-wrap gap-x-2">
                      <span className="font-medium text-slate-500">
                        {t("steps.vice")}
                      </span>
                      <span>{viceId ? t(`inputs.${viceId}`) : "—"}</span>
                    </li>
                    <li className="flex flex-wrap gap-x-2">
                      <span className="font-medium text-slate-500">
                        {t("steps.mood")}
                      </span>
                      <span>{moodId ? t(`moods.${moodId}`) : "—"}</span>
                    </li>
                  </>
                )}
                {mode === "matchup" && (
                  <>
                    <li className="flex flex-wrap gap-x-2">
                      <span className="font-medium text-slate-500">
                        {t("matchup.left")}
                      </span>
                      <span>{leftId ? t(`inputs.${leftId}`) : "—"}</span>
                    </li>
                    <li className="flex flex-wrap gap-x-2">
                      <span className="font-medium text-slate-500">
                        {t("matchup.right")}
                      </span>
                      <span>{rightId ? t(`inputs.${rightId}`) : "—"}</span>
                    </li>
                  </>
                )}
                {mode === "weekly" &&
                  weeklyIds.map((id) => (
                    <li key={id}>{t(`inputs.${id}`)}</li>
                  ))}
              </ul>
            </div>

            <motion.div
              key={insightId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={easeOut}
              className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-amber-100"
            >
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb
                  className="h-4 w-4 text-amber-500"
                  strokeWidth={ICON_STROKE_WIDTH}
                />
                <p className="label-caption text-amber-600">
                  {deepMode ? t("actions.deepDive") : t("result.insightCaption")}
                </p>
              </div>
              <p className="text-base leading-relaxed text-slate-800">
                {displayInsight}
              </p>
              {mode === "classic" && (
                <p className="mt-3 text-xs text-slate-500">{timeNote}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2"
                  onClick={() => refreshInsight(false)}
                >
                  <RefreshCw className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                  {t("actions.newInsight")}
                </button>
                {mode === "classic" && (
                  <button
                    type="button"
                    className="btn-secondary inline-flex items-center gap-2"
                    onClick={() => refreshInsight(true)}
                  >
                    <Sparkles className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                    {t("actions.deepDive")}
                  </button>
                )}
              </div>
            </motion.div>

            <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-100">
              <p className="label-caption mb-3 text-slate-400">{t("card.title")}</p>
              <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 ring-1 ring-rose-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {brandName}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">{cardTitle}</p>
                <p className="mt-3 font-mono text-4xl font-bold text-rose-600">
                  {cardScoreText}
                </p>
                {cardBadge && (
                  <p className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                    {cardBadge}
                  </p>
                )}
                <p className="mt-4 text-sm leading-relaxed text-slate-700">
                  {displayInsight}
                </p>
                <p className="mt-4 text-xs text-slate-400">{t("card.footer")}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
                  disabled={cardBusy}
                  onClick={() => void handleDownloadCard()}
                >
                  <Download className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                  {t("card.download")}
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
                  disabled={cardBusy}
                  onClick={() => void handleCopyCard()}
                >
                  <Share2 className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                  {t("card.copyImage")}
                </button>
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2"
                  onClick={() => void copyShare()}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" strokeWidth={ICON_STROKE_WIDTH} />
                  ) : (
                    <Share2 className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                  )}
                  {copied ? t("actions.copied") : t("card.copyText")}
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
                {t("actions.shareResult")}
              </button>
              <button type="button" className="btn-secondary" onClick={handleClear}>
                {t("actions.tryAgain")}
              </button>
            </div>

            <CalculationSavePanel
              toolSlug="love-calculator"
              saveName={saveName}
              onSaveNameChange={setSaveName}
              inputs={{
                mode,
                joyId,
                viceId,
                moodId,
                leftId,
                rightId,
                weeklyIds,
                insightId,
                score: displayScore,
                band: displayBand,
                friction: matchup?.friction,
                weeklyTitleId: weekly?.titleId,
              }}
              resultSummary={
                mode === "matchup" && matchup
                  ? t("matchup.resultSummary", {
                      score: formatScore(matchup.score),
                      friction: formatScore(matchup.friction),
                    })
                  : mode === "weekly" && weekly
                    ? t("weekly.resultSummary", {
                        score: formatScore(weekly.score),
                        title: weeklyTitle,
                      })
                    : t("resultSummary", {
                        score: formatScore(displayScore),
                        band: displayBand
                          ? t(`result.band.${displayBand}`)
                          : "",
                      })
              }
            />

            <Link
              href={toolsPath}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {t("actions.backToTools")}
              <ArrowRight
                className="h-4 w-4 rtl:rotate-180"
                strokeWidth={ICON_STROKE_WIDTH}
              />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key={`pick-${mode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {mode === "classic" && (
              <>
                <SelectionCard
                  title={t("steps.joy")}
                  hint={t("steps.joyHint")}
                  active={picker === "joy"}
                  value={joyId ? t(`inputs.${joyId}`) : null}
                  onActivate={() => setPicker("joy")}
                  pickLabel={t("actions.pick")}
                  changeLabel={t("actions.change")}
                />
                <SelectionCard
                  title={t("steps.vice")}
                  hint={t("steps.viceHint")}
                  active={picker === "vice"}
                  value={viceId ? t(`inputs.${viceId}`) : null}
                  onActivate={() => setPicker("vice")}
                  pickLabel={t("actions.pick")}
                  changeLabel={t("actions.change")}
                />
                <div className="rounded-2xl bg-white p-5 shadow-md">
                  <p className="label-caption mb-1 text-blue-500">
                    {t("steps.mood")}
                  </p>
                  <p className="mb-4 text-xs text-slate-500">{t("steps.moodHint")}</p>
                  <div className="flex flex-wrap gap-2">
                    {LOVE_MOODS.map((mood) => {
                      const selected = moodId === mood.id;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => setMoodId(mood.id)}
                          className={`rounded-xl px-3 py-2 text-sm transition ${
                            selected
                              ? "bg-rose-500 font-semibold text-white shadow-sm"
                              : "bg-slate-50 text-slate-700 ring-1 ring-slate-100 hover:bg-rose-50 hover:text-rose-700"
                          }`}
                        >
                          {t(`moods.${mood.id}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {mode === "matchup" && (
              <>
                <SelectionCard
                  title={t("matchup.left")}
                  hint={t("matchup.leftHint")}
                  active={picker === "left"}
                  value={leftId ? t(`inputs.${leftId}`) : null}
                  onActivate={() => setPicker("left")}
                  pickLabel={t("actions.pick")}
                  changeLabel={t("actions.change")}
                />
                <SelectionCard
                  title={t("matchup.right")}
                  hint={t("matchup.rightHint")}
                  active={picker === "right"}
                  value={rightId ? t(`inputs.${rightId}`) : null}
                  onActivate={() => setPicker("right")}
                  pickLabel={t("actions.pick")}
                  changeLabel={t("actions.change")}
                />
              </>
            )}

            {mode === "weekly" && (
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <p className="label-caption mb-1 text-blue-500">
                  {t("weekly.pickTitle")}
                </p>
                <p className="mb-2 text-xs text-slate-500">{t("weekly.pickHint")}</p>
                <p className="mb-4 text-sm font-medium text-rose-600">
                  {t("weekly.selected", { count: weeklyIds.length })}
                </p>
                {weeklyIds.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {weeklyIds.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          setWeeklyIds((prev) => prev.filter((item) => item !== id))
                        }
                        className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 ring-1 ring-rose-100"
                      >
                        {t(`inputs.${id}`)} ×
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className={`rounded-xl px-3 py-2 text-sm ring-2 ${
                    picker === "weekly"
                      ? "ring-rose-300 bg-rose-50"
                      : "ring-transparent bg-slate-50"
                  }`}
                  onClick={() => setPicker("weekly")}
                >
                  {t("actions.pick")}
                </button>
              </div>
            )}

            {(picker === "joy" ||
              picker === "vice" ||
              picker === "left" ||
              picker === "right" ||
              picker === "weekly") && (
              <div className="rounded-2xl bg-white p-5 shadow-md">
                <p className="label-caption mb-3 text-rose-500">
                  {picker === "joy"
                    ? t("steps.joy")
                    : picker === "vice"
                      ? t("steps.vice")
                      : picker === "left"
                        ? t("matchup.left")
                        : picker === "right"
                          ? t("matchup.right")
                          : t("weekly.pickTitle")}
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {LOVE_INPUT_CATEGORY_ORDER.map((category) => {
                    const selected = activeCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                          selected
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {t(`categories.${category}`)}
                      </button>
                    );
                  })}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {categoryItems.map((item) => {
                    const selected =
                      (picker === "joy" && joyId === item.id) ||
                      (picker === "vice" && viceId === item.id) ||
                      (picker === "left" && leftId === item.id) ||
                      (picker === "right" && rightId === item.id) ||
                      (picker === "weekly" && weeklyIds.includes(item.id));
                    const blocked =
                      (picker === "joy" && viceId === item.id) ||
                      (picker === "vice" && joyId === item.id) ||
                      (picker === "left" && rightId === item.id) ||
                      (picker === "right" && leftId === item.id) ||
                      (picker === "weekly" &&
                        !weeklyIds.includes(item.id) &&
                        weeklyIds.length >= 3);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={blocked}
                        onClick={() => selectInput(item.id)}
                        className={`rounded-xl px-3.5 py-3 text-start text-sm transition ring-1 ${
                          selected
                            ? "bg-rose-50 font-medium text-rose-800 ring-rose-200"
                            : blocked
                              ? "cursor-not-allowed bg-slate-50 text-slate-300 ring-slate-100"
                              : "bg-white text-slate-700 ring-slate-100 hover:bg-slate-50 hover:ring-slate-200"
                        }`}
                      >
                        {t(`inputs.${item.id}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!canCalculate && (
              <p className="text-center text-sm text-slate-400">
                {mode === "matchup"
                  ? t("matchup.needBoth")
                  : mode === "weekly"
                    ? t("weekly.needThree")
                    : t("empty.needAll")}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canCalculate}
                onClick={runCalculate}
              >
                <Heart className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                {mode === "matchup"
                  ? t("matchup.calculate")
                  : mode === "weekly"
                    ? t("weekly.calculate")
                    : t("actions.calculate")}
              </button>
              {hasInput && (
                <button type="button" className="btn-secondary" onClick={handleClear}>
                  {tc("reset")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectionCard({
  title,
  hint,
  active,
  value,
  onActivate,
  pickLabel,
  changeLabel,
}: {
  title: string;
  hint: string;
  active: boolean;
  value: string | null;
  onActivate: () => void;
  pickLabel: string;
  changeLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className={`w-full rounded-2xl bg-white p-5 text-start shadow-md transition ring-2 ${
        active ? "ring-rose-300" : "ring-transparent hover:ring-slate-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caption mb-1 text-blue-500">{title}</p>
          <p className="text-xs text-slate-500">{hint}</p>
          {value ? (
            <p className="mt-3 text-base font-semibold text-slate-900">{value}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">{pickLabel}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
          {value ? changeLabel : pickLabel}
        </span>
      </div>
    </button>
  );
}
