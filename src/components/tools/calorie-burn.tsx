"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Flame,
  Share2,
  Sparkles,
} from "lucide-react";
import { CalculationSavePanel } from "@/components/tools/calculation-save-panel";
import { useCalculationRestore } from "@/hooks/use-calculation-restore";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLocalizedPath } from "@/hooks/use-localized-path";
import { usePrivateToolStats } from "@/hooks/use-private-tool-stats";
import { useToolTranslation } from "@/hooks/use-tool-translation";
import type { CalculationHistoryEntry } from "@/lib/calculation-history";
import { useTranslation } from "@/lib/i18n/provider";
import {
  ACTIVITY_CATEGORY_ORDER,
  CALORIE_ACTIVITIES,
  analyzeCalorieBurn,
  copyCalorieCardImage,
  downloadCalorieCard,
  estimateBmr,
  isCalorieProfileComplete,
  kgToLb,
  normalizeWeightToKg,
  type ActivityId,
  type BiologicalSex,
  type CalorieBurnResult,
  type CalorieProfile,
  type WeightUnit,
} from "@/lib/calorie-burn";
import { easeOut, springSnappy } from "@/lib/motion-presets";
import { ICON_STROKE_WIDTH } from "@/lib/tool-icons";

type Phase = "profile" | "activities" | "result";

const DEFAULT_PROFILE: Partial<CalorieProfile> = {
  weightUnit: "kg",
};

const DEFAULT_MINUTES = 30;

export function CalorieBurnCalculator() {
  const { t } = useToolTranslation("calorie-burn-calculator");
  const { t: tCommon } = useTranslation("common");
  const localizePath = useLocalizedPath();
  const toolsPath = localizePath("/tools");
  const dir = useLocaleDirection();
  const rtl = dir === "rtl";
  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const NextIcon = rtl ? ArrowLeft : ArrowRight;

  const { trackStart, trackAnswer, trackComplete, trackSetupChoice } =
    usePrivateToolStats("calorie-burn-calculator");

  const [profile, setProfile] = useLocalStorage<Partial<CalorieProfile>>(
    "tool:calorie-burn:profile",
    DEFAULT_PROFILE,
  );
  const [selected, setSelected] = useLocalStorage<ActivityId[]>(
    "tool:calorie-burn:selected",
    [],
  );
  const [minutesById, setMinutesById] = useLocalStorage<
    Partial<Record<ActivityId, number>>
  >("tool:calorie-burn:minutes", {});

  const [phase, setPhase] = useState<Phase>("profile");
  const [result, setResult] = useState<CalorieBurnResult | null>(null);
  const [saveName, setSaveName] = useState("");
  const [copied, setCopied] = useState(false);
  const [cardStatus, setCardStatus] = useState<string | null>(null);
  const [cardBusy, setCardBusy] = useState(false);
  const [needOneHint, setNeedOneHint] = useState(false);

  const profileReady = isCalorieProfileComplete(profile);
  const brandName = tCommon("app.name");

  const weightDisplay = useMemo(() => {
    if (typeof profile.weightKg !== "number") return "";
    if (profile.weightUnit === "lb") {
      return String(Math.round(kgToLb(profile.weightKg) * 10) / 10);
    }
    return String(profile.weightKg);
  }, [profile.weightKg, profile.weightUnit]);

  const bmrPreview = useMemo(() => {
    if (!profileReady) return null;
    return estimateBmr(profile.weightKg, profile.age, profile.sex);
  }, [profile, profileReady]);

  const groupedActivities = useMemo(() => {
    return ACTIVITY_CATEGORY_ORDER.map((category) => ({
      category,
      items: CALORIE_ACTIVITIES.filter((a) => a.category === category),
    })).filter((group) => group.items.length > 0);
  }, []);

  const handleRestore = useCallback(
    (entry: CalculationHistoryEntry) => {
      const restoredProfile =
        (entry.inputs.profile as CalorieProfile | undefined) ?? null;
      const restoredLines = Array.isArray(entry.inputs.lines)
        ? (entry.inputs.lines as {
            activityId?: ActivityId;
            minutes?: number;
          }[])
        : [];

      if (restoredProfile && isCalorieProfileComplete(restoredProfile)) {
        setProfile(restoredProfile);
      }

      if (restoredLines.length > 0) {
        const ids: ActivityId[] = [];
        const mins: Partial<Record<ActivityId, number>> = {};
        for (const line of restoredLines) {
          if (!line.activityId || typeof line.minutes !== "number") continue;
          ids.push(line.activityId);
          mins[line.activityId] = line.minutes;
        }
        setSelected(ids);
        setMinutesById(mins);
        if (restoredProfile && isCalorieProfileComplete(restoredProfile)) {
          const analyzed = analyzeCalorieBurn(
            restoredProfile,
            ids.map((id) => ({
              activityId: id,
              minutes: mins[id] ?? DEFAULT_MINUTES,
            })),
          );
          if (analyzed) {
            setResult(analyzed);
            setPhase("result");
            setSaveName(entry.name);
            return;
          }
        }
        setPhase("activities");
      } else if (restoredProfile) {
        setPhase("profile");
      }
      setSaveName(entry.name);
    },
    [setProfile, setSelected, setMinutesById],
  );

  useCalculationRestore("calorie-burn-calculator", handleRestore);

  const setWeightInput = (raw: string) => {
    const num = Number(raw);
    if (!Number.isFinite(num) || raw.trim() === "") {
      setProfile((prev) => ({ ...prev, weightKg: undefined }));
      return;
    }
    const unit = profile.weightUnit ?? "kg";
    setProfile((prev) => ({
      ...prev,
      weightKg: normalizeWeightToKg(num, unit),
      weightUnit: unit,
    }));
  };

  const setWeightUnit = (unit: WeightUnit) => {
    setProfile((prev) => {
      const next: Partial<CalorieProfile> = { ...prev, weightUnit: unit };
      return next;
    });
    trackSetupChoice("weightUnit", unit);
  };

  const setAge = (raw: string) => {
    const num = Number(raw);
    if (!Number.isFinite(num) || raw.trim() === "") {
      setProfile((prev) => ({ ...prev, age: undefined }));
      return;
    }
    setProfile((prev) => ({
      ...prev,
      age: Math.min(100, Math.max(14, Math.round(num))),
    }));
  };

  const setSex = (sex: BiologicalSex) => {
    setProfile((prev) => ({ ...prev, sex }));
    trackSetupChoice("sex", sex);
  };

  const toggleActivity = (id: ActivityId) => {
    setNeedOneHint(false);
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      setMinutesById((mins) =>
        mins[id] ? mins : { ...mins, [id]: DEFAULT_MINUTES },
      );
      return [...prev, id];
    });
  };

  const setMinutes = (id: ActivityId, raw: string) => {
    const num = Number(raw);
    if (!Number.isFinite(num) || raw.trim() === "") {
      setMinutesById((prev) => ({ ...prev, [id]: undefined }));
      return;
    }
    setMinutesById((prev) => ({
      ...prev,
      [id]: Math.min(600, Math.max(1, Math.round(num))),
    }));
  };

  const goToActivities = () => {
    if (!profileReady) return;
    trackStart({ mode: "multi" });
    setPhase("activities");
  };

  const runCalculate = () => {
    if (!profileReady) return;
    const selections = selected
      .map((activityId) => ({
        activityId,
        minutes: minutesById[activityId] ?? 0,
      }))
      .filter((s) => s.minutes > 0);

    if (selections.length === 0) {
      setNeedOneHint(true);
      return;
    }

    for (const sel of selections) {
      trackAnswer(sel.activityId, sel.minutes);
    }

    const analyzed = analyzeCalorieBurn(profile, selections);
    if (!analyzed) {
      setNeedOneHint(true);
      return;
    }
    setResult(analyzed);
    setPhase("result");
    setSaveName("");
    trackComplete({
      mode: "multi",
      outcome: `${analyzed.lines.length}-activities`,
    });
  };

  const shareText = useMemo(() => {
    if (!result) return "";
    return t("result.shareText", {
      total: result.totalKcal,
      count: result.lines.length,
      minutes: result.totalMinutes,
    });
  }, [result, t]);

  const resultSummary = useMemo(() => {
    if (!result) return "";
    return t("result.resultSummary", {
      total: result.totalKcal,
      count: result.lines.length,
      minutes: result.totalMinutes,
    });
  }, [result, t]);

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
    if (typeof navigator === "undefined" || !navigator.share) {
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

  const handleDownloadCard = async () => {
    if (!result) return;
    setCardBusy(true);
    setCardStatus(null);
    try {
      await downloadCalorieCard({
        brand: brandName,
        title: t("intro.title"),
        totalLabel: t("result.totalLabel"),
        totalText: t("result.kcal", { value: result.totalKcal }),
        metaLine: t("result.totalMinutes", { minutes: result.totalMinutes }),
        lines: result.lines.map((line) => ({
          label: t(`activities.items.${line.activityId}`),
          value: t("result.kcal", { value: line.kcal }),
        })),
        tip: t(`result.tips.${result.tipIds[0] ?? "listen"}`),
        footer: t("card.footer"),
        rtl,
      });
    } catch {
      setCardStatus(t("result.cardBusy"));
    } finally {
      setCardBusy(false);
    }
  };

  const handleCopyCard = async () => {
    if (!result) return;
    setCardBusy(true);
    try {
      const ok = await copyCalorieCardImage({
        brand: brandName,
        title: t("intro.title"),
        totalLabel: t("result.totalLabel"),
        totalText: t("result.kcal", { value: result.totalKcal }),
        metaLine: t("result.totalMinutes", { minutes: result.totalMinutes }),
        lines: result.lines.map((line) => ({
          label: t(`activities.items.${line.activityId}`),
          value: t("result.kcal", { value: line.kcal }),
        })),
        tip: t(`result.tips.${result.tipIds[0] ?? "listen"}`),
        footer: t("card.footer"),
        rtl,
      });
      setCardStatus(ok ? t("result.copied") : null);
    } finally {
      setCardBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Flame className="h-5 w-5" strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
        </span>
        <div>
          <p className="label-caption text-orange-600">{t("intro.badge")}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {t("intro.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t("intro.description")}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={easeOut}
            className="space-y-5"
          >
            <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {t("profile.title")}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {t("profile.subtitle")}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="label-caption mb-1.5 block text-slate-500">
                    {t("profile.weight")}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={profile.weightUnit === "lb" ? 77 : 35}
                      max={profile.weightUnit === "lb" ? 550 : 250}
                      value={weightDisplay}
                      onChange={(e) => setWeightInput(e.target.value)}
                      className="input-field flex-1"
                    />
                    <div className="flex overflow-hidden rounded-xl ring-1 ring-slate-200">
                      {(["kg", "lb"] as WeightUnit[]).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setWeightUnit(unit)}
                          className={`px-3 py-2 text-sm font-semibold transition ${
                            (profile.weightUnit ?? "kg") === unit
                              ? "bg-orange-600 text-white"
                              : "bg-white text-slate-600 hover:bg-orange-50"
                          }`}
                        >
                          {unit === "kg"
                            ? t("profile.weightUnitKg")
                            : t("profile.weightUnitLb")}
                        </button>
                      ))}
                    </div>
                  </div>
                </label>

                <label className="block">
                  <span className="label-caption mb-1.5 block text-slate-500">
                    {t("profile.age")}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={14}
                    max={100}
                    value={profile.age ?? ""}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-field w-full"
                  />
                </label>

                <div>
                  <span className="label-caption mb-1.5 block text-slate-500">
                    {t("profile.sex")}
                  </span>
                  <div className="flex gap-2">
                    {([
                      ["female", "sexFemale"],
                      ["male", "sexMale"],
                    ] as const).map(([value, labelKey]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSex(value)}
                        className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ring-1 ${
                          profile.sex === value
                            ? "bg-orange-600 text-white ring-orange-600"
                            : "bg-slate-50 text-slate-700 ring-slate-100 hover:bg-orange-50"
                        }`}
                      >
                        {t(`profile.${labelKey}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {bmrPreview != null && (
                <p className="mt-4 rounded-xl bg-orange-50/80 px-4 py-3 text-sm text-orange-900 ring-1 ring-orange-100">
                  <span className="font-medium">{t("profile.bmrHint")}: </span>
                  {t("profile.bmrValue", { value: bmrPreview })}
                </p>
              )}
            </div>

            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2"
              disabled={!profileReady}
              onClick={goToActivities}
            >
              {t("profile.continue")}
              <NextIcon className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
            </button>
          </motion.div>
        )}

        {phase === "activities" && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={easeOut}
            className="space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t("activities.title")}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {t("activities.subtitle")}
                </p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
                {t("activities.selected", { count: selected.length })}
              </span>
            </div>

            <div className="space-y-6">
              {groupedActivities.map((group) => (
                <div key={group.category} className="space-y-3">
                  <p className="label-caption text-orange-700">
                    {t(`activities.categories.${group.category}`)}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.items.map((activity) => {
                      const on = selected.includes(activity.id);
                      return (
                        <div
                          key={activity.id}
                          className={`rounded-2xl p-3 ring-1 transition ${
                            on
                              ? "bg-orange-50 ring-orange-200"
                              : "bg-white ring-slate-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleActivity(activity.id)}
                            className="flex w-full items-center gap-3 text-start"
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${
                                on
                                  ? "bg-orange-600 text-white ring-orange-600"
                                  : "bg-white text-transparent ring-slate-200"
                              }`}
                            >
                              <Check
                                className="h-3.5 w-3.5"
                                strokeWidth={ICON_STROKE_WIDTH}
                                aria-hidden
                              />
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900">
                              {t(`activities.items.${activity.id}`)}
                            </span>
                          </button>
                          {on && (
                            <label className="mt-3 block ps-9">
                              <span className="label-caption mb-1 block text-slate-500">
                                {t("activities.duration")}
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={1}
                                  max={600}
                                  value={minutesById[activity.id] ?? ""}
                                  onChange={(e) =>
                                    setMinutes(activity.id, e.target.value)
                                  }
                                  className="input-field w-28 py-2"
                                />
                                <span className="text-xs font-medium text-slate-500">
                                  {t("activities.minutes")}
                                </span>
                              </div>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {needOneHint && (
              <p className="text-sm font-medium text-rose-600">
                {t("activities.needOne")}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                onClick={() => setPhase("profile")}
              >
                <BackIcon className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                {t("activities.back")}
              </button>
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2"
                onClick={runCalculate}
              >
                {t("activities.calculate")}
                <Sparkles
                  className="h-4 w-4"
                  strokeWidth={ICON_STROKE_WIDTH}
                />
              </button>
            </div>
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={easeOut}
            className="space-y-5"
          >
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-md ring-1 ring-orange-100">
              <p className="label-caption text-orange-700">
                {t("result.badge")}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {t("result.title")}
              </h3>
              <p className="mt-4 text-sm font-medium text-orange-800/80">
                {t("result.totalLabel")}
              </p>
              <motion.p
                className="mt-1 text-4xl font-bold tracking-tight text-orange-700 sm:text-5xl"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springSnappy}
              >
                {t("result.kcal", { value: result.totalKcal })}
              </motion.p>
              <p className="mt-3 text-sm text-slate-600">
                {t("result.totalMinutes", { minutes: result.totalMinutes })}
                {" · "}
                {t("result.perMinute", { value: result.avgKcalPerMinute })}
              </p>
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-orange-700 underline-offset-2 hover:underline"
                onClick={() => setPhase("profile")}
              >
                {t("profile.edit")}
              </button>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
              <h4 className="text-base font-semibold text-slate-900">
                {t("result.breakdownTitle")}
              </h4>
              <ul className="mt-4 space-y-3">
                {result.lines.map((line) => {
                  const share =
                    result.totalKcal > 0
                      ? Math.round((line.kcal / result.totalKcal) * 100)
                      : 0;
                  return (
                    <li key={line.activityId}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {t(`activities.items.${line.activityId}`)}
                        </p>
                        <p className="text-sm font-bold text-orange-700">
                          {t("result.kcal", { value: line.kcal })}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t("result.lineMeta", {
                          minutes: line.minutes,
                          met: line.met,
                          perMin: line.kcalPerMinute,
                        })}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
              <h4 className="text-base font-semibold text-slate-900">
                {t("result.tipsTitle")}
              </h4>
              <ul className="mt-3 space-y-2">
                {result.tipIds.map((id) => (
                  <li
                    key={id}
                    className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700"
                  >
                    {t(`result.tips.${id}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                onClick={copyText}
              >
                {copied ? t("result.copied") : t("result.copy")}
              </button>
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                onClick={nativeShare}
              >
                <Share2 className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                {t("result.share")}
              </button>
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                disabled={cardBusy}
                onClick={handleDownloadCard}
              >
                <Download className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                {cardBusy ? t("result.cardBusy") : t("result.downloadCard")}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={cardBusy}
                onClick={handleCopyCard}
              >
                {t("result.copy")}
              </button>
            </div>
            {cardStatus && (
              <p className="text-sm text-slate-500">{cardStatus}</p>
            )}

            <CalculationSavePanel
              toolSlug="calorie-burn-calculator"
              inputs={{
                profile: result.profile,
                lines: result.lines,
                totalKcal: result.totalKcal,
                totalMinutes: result.totalMinutes,
                tipIds: result.tipIds,
                bmr: result.bmr,
              }}
              resultSummary={resultSummary}
              saveName={saveName}
              onSaveNameChange={setSaveName}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2"
                onClick={() => setPhase("activities")}
              >
                {t("result.changeActivities")}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={runCalculate}
              >
                {t("result.recalculate")}
              </button>
              <Link href={toolsPath} className="btn-secondary">
                {t("result.backHome")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
