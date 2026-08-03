"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  Trash2,
  X,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/provider";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import { useLocalizedPath } from "@/hooks/use-localized-path";
import {
  formatHistoryDate,
  getEntryDisplayName,
  type CalculationHistoryEntry,
} from "@/lib/calculation-history";
import { getToolIcon, ICON_STROKE_WIDTH } from "@/lib/tool-icons";
import { fadeSlideUp, staggerList, toolIconHover } from "@/lib/motion-presets";
import { useCalculationHistory } from "@/hooks/use-calculation-history";

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "✓" : "—";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  return String(value);
}

function resolveLoveLabel(
  tLove: TranslateFn,
  kind: "inputs" | "moods" | "modes" | "bands",
  id: string,
): string {
  if (kind === "bands") {
    const key = `result.band.${id}`;
    const label = tLove(key);
    return label === key ? id : label;
  }
  const key = `${kind}.${id}`;
  const label = tLove(key);
  return label === key ? id : label;
}

function firstResolved(
  translators: TranslateFn[],
  key: string,
): string | null {
  for (const translate of translators) {
    const label = translate(key);
    if (label !== key) return label;
  }
  return null;
}

function formatInputValue(
  key: string,
  value: unknown,
  tLove: TranslateFn,
  tQuiz: TranslateFn[],
): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (
      key === "weeklyIds" &&
      value.every((item) => typeof item === "string")
    ) {
      return value
        .map((id) => resolveLoveLabel(tLove, "inputs", String(id)))
        .join(" · ");
    }
    if (
      (key === "insightIds" ||
        key === "tipIds" ||
        key === "agreementIds" ||
        key === "habitIds") &&
      value.every((item) => typeof item === "string")
    ) {
      const prefix =
        key === "insightIds"
          ? "insights"
          : key === "tipIds"
            ? "tips"
            : key === "habitIds"
              ? "habits"
              : "agreement";
      return value
        .map((id) => {
          const nsKey = `${prefix}.${id}`;
          return firstResolved(tQuiz, nsKey) ?? String(id);
        })
        .join("\n");
    }
    if (
      key === "dimensions" &&
      value.every((item) => item && typeof item === "object")
    ) {
      return value
        .map((item) => {
          const row = item as {
            dimension?: string;
            score?: number;
            band?: string;
          };
          const dimLabel = row.dimension
            ? (firstResolved(
                tQuiz,
                `result.dimensionLabels.${row.dimension}`,
              ) ?? row.dimension)
            : "—";
          const bandLabel = row.band
            ? (firstResolved(tQuiz, `result.bands.${row.band}`) ?? "")
            : "";
          const score =
            typeof row.score === "number" ? `${row.score.toFixed(1)}%` : "";
          return [dimLabel, score, bandLabel].filter(Boolean).join(" · ");
        })
        .join("\n");
    }
    return value.map((item) => formatPrimitive(item)).join(", ");
  }

  if (value && typeof value === "object") {
    if (key === "answers") {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return "—";
      return entries
        .map(([questionId, answer]) => {
          const promptKey = `questions.${questionId}.prompt`;
          const prompt = firstResolved(tQuiz, promptKey) ?? questionId;
          const short =
            prompt.length > 72 ? `${prompt.slice(0, 72)}…` : prompt;
          const option =
            firstResolved(
              tQuiz,
              `questions.${questionId}.options.${answer}`,
            ) ??
            firstResolved(tQuiz, `scale.${answer}`) ??
            String(answer);
          return `${short}: ${option}`;
        })
        .join("\n");
    }
    if (key === "setup") {
      const setup = value as Record<string, unknown>;
      const parts = Object.entries(setup)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([field, v]) => {
          return firstResolved(tQuiz, `setup.${field}.${v}`) ?? String(v);
        });
      return parts.length > 0 ? parts.join(" · ") : "—";
    }
    if (key === "recommendedAmount") {
      const amount = value as { min?: number; mid?: number; max?: number };
      const symbol =
        firstResolved(tQuiz, "currency.symbol") ?? "";
      const mid = amount.mid ?? "—";
      const min = amount.min ?? "—";
      const max = amount.max ?? "—";
      return `${min}–${max} ${symbol} · ${mid} ${symbol}`.trim();
    }
    if (key === "split") {
      const split = value as {
        spend?: number;
        save?: number;
        give?: number;
      };
      const spend =
        firstResolved(tQuiz, "result.spend") ?? "Spend";
      const save = firstResolved(tQuiz, "result.save") ?? "Save";
      const give = firstResolved(tQuiz, "result.give") ?? "Give";
      return `${spend} ${split.spend ?? "—"}% · ${save} ${split.save ?? "—"}% · ${give} ${split.give ?? "—"}%`;
    }
    if (key === "costs") {
      const costs = value as {
        monthlyTotal?: number;
        annualTotal?: number;
        oneTimeTotal?: number;
        recommendedMonthly?: number;
        yearlyForecast?: number;
      };
      const symbol = firstResolved(tQuiz, "currency.symbol") ?? "";
      const parts = [
        costs.recommendedMonthly != null
          ? `${costs.recommendedMonthly} ${symbol}/mo`
          : null,
        costs.yearlyForecast != null
          ? `${costs.yearlyForecast} ${symbol}/yr`
          : null,
        costs.oneTimeTotal != null
          ? `${costs.oneTimeTotal} ${symbol} one-time`
          : null,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : "—";
    }
    if (key === "metrics") {
      const metrics = value as {
        bmi?: number;
        bmiBand?: string;
        bmr?: number;
        tdee?: number;
        sleepBand?: string;
      };
      const bmiLabel = firstResolved(tQuiz, "metrics.bmi") ?? "BMI";
      const bmrLabel = firstResolved(tQuiz, "metrics.bmr") ?? "BMR";
      const tdeeLabel = firstResolved(tQuiz, "metrics.tdee") ?? "TDEE";
      const band =
        metrics.bmiBand != null
          ? (firstResolved(tQuiz, `metrics.bmiBand.${metrics.bmiBand}`) ??
            metrics.bmiBand)
          : "";
      const parts = [
        metrics.bmi != null
          ? `${bmiLabel} ${metrics.bmi}${band ? ` (${band})` : ""}`
          : null,
        metrics.bmr != null ? `${bmrLabel} ${metrics.bmr}` : null,
        metrics.tdee != null ? `${tdeeLabel} ${metrics.tdee}` : null,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : "—";
    }
    if (key === "lines") {
      return (value as { activityId?: string; minutes?: number; kcal?: number }[])
        .map((line) => {
          const name = line.activityId
            ? (firstResolved(tQuiz, `activities.items.${line.activityId}`) ??
              line.activityId)
            : "—";
          const kcal =
            line.kcal != null
              ? (firstResolved(tQuiz, "result.kcal")?.replace(
                  "{{value}}",
                  String(line.kcal),
                ) ?? `${line.kcal} kcal`)
              : "";
          return `${name}: ${line.minutes ?? "—"} min · ${kcal}`;
        })
        .join("\n");
    }
    if (key === "profile" && value && typeof value === "object") {
      const profile = value as {
        weightKg?: number;
        age?: number;
        sex?: string;
      };
      const sexLabel = profile.sex
        ? (firstResolved(tQuiz, `profile.sex${profile.sex === "female" ? "Female" : "Male"}`) ??
          profile.sex)
        : null;
      const parts = [
        profile.weightKg != null ? `${profile.weightKg} kg` : null,
        profile.age != null ? String(profile.age) : null,
        sexLabel,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(" · ") : "—";
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return formatPrimitive(value);
  }

  const raw = String(value);

  if (key === "joyId" || key === "viceId" || key === "leftId" || key === "rightId") {
    return resolveLoveLabel(tLove, "inputs", raw);
  }
  if (key === "moodId") return resolveLoveLabel(tLove, "moods", raw);
  if (key === "mode") {
    const loveMode = resolveLoveLabel(tLove, "modes", raw);
    if (loveMode !== raw) return loveMode;
    return firstResolved(tQuiz, `modes.${raw}`) ?? raw;
  }
  if (key === "band" || key === "overallBand") {
    const loveBand = resolveLoveLabel(tLove, "bands", raw);
    if (loveBand !== raw) return loveBand;
    return firstResolved(tQuiz, `result.bands.${raw}`) ?? raw;
  }
  if (key === "profileId") {
    return firstResolved(tQuiz, `profiles.${raw}`) ?? raw;
  }
  if (key === "score" || key === "friction" || key === "overall") {
    const num = Number(value);
    return Number.isFinite(num) ? `${num.toFixed(1)}%` : raw;
  }
  if (
    key === "recommendedMonthly" ||
    key === "yearlyForecast" ||
    key === "oneTimeTotal"
  ) {
    const num = Number(value);
    const symbol = firstResolved(tQuiz, "currency.symbol") ?? "";
    return Number.isFinite(num) ? `${num} ${symbol}`.trim() : raw;
  }

  return raw;
}

function buildDetailRows(
  entry: CalculationHistoryEntry,
  t: TranslateFn,
  tLove: TranslateFn,
  tQuiz: TranslateFn[],
): { label: string; value: string }[] {
  const preferredOrder = [
    "mode",
    "score",
    "overall",
    "band",
    "overallBand",
    "profileId",
    "setup",
    "recommendedAmount",
    "split",
    "recommendedMonthly",
    "yearlyForecast",
    "oneTimeTotal",
    "costs",
    "friction",
    "joyId",
    "viceId",
    "moodId",
    "leftId",
    "rightId",
    "weeklyIds",
    "dimensions",
    "metrics",
    "lines",
    "totalKcal",
    "totalMinutes",
    "bmr",
    "insightIds",
    "tipIds",
    "agreementIds",
    "habitIds",
    "insightId",
    "weeklyTitleId",
    "answers",
  ];

  const keys = Object.keys(entry.inputs);
  const ordered = [
    ...preferredOrder.filter((key) => keys.includes(key)),
    ...keys.filter((key) => !preferredOrder.includes(key)).sort(),
  ];

  return ordered
    .filter((key) => entry.inputs[key] !== undefined && entry.inputs[key] !== "")
    .map((key) => {
      const labelKey = `recent.fields.${key}`;
      const translated = t(labelKey);
      return {
        label: translated === labelKey ? humanizeKey(key) : translated,
        value: formatInputValue(key, entry.inputs[key], tLove, tQuiz),
      };
    });
}

export function RecentCalculations() {
  const { t } = useTranslation("common");
  const { history, isHydrated, clearHistory, removeEntry } = useCalculationHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isHydrated || history.length === 0) return null;

  const expandedEntry =
    expandedId === null
      ? null
      : (history.find((entry) => entry.id === expandedId) ?? null);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {t("recent.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t("recent.description")}</p>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          className="text-xs font-medium text-slate-400 transition duration-200 hover:text-slate-600"
        >
          {t("recent.clearAll")}
        </button>
      </div>

      <motion.ul
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={staggerList}
        initial="hidden"
        animate="show"
      >
        {history.map((entry) => (
          <RecentCalculationItem
            key={entry.id}
            entry={entry}
            expanded={expandedId === entry.id}
            onExpand={() => setExpandedId(entry.id)}
            onDelete={removeEntry}
          />
        ))}
      </motion.ul>

      <RecentCalculationModal
        entry={expandedEntry}
        onClose={() => setExpandedId(null)}
      />
    </section>
  );
}

function RecentCalculationItem({
  entry,
  expanded,
  onExpand,
  onDelete,
}: {
  entry: CalculationHistoryEntry;
  expanded: boolean;
  onExpand: () => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation("common");
  const lp = useLocalizedPath();
  const Icon = getToolIcon(entry.toolSlug);
  const displayName = getEntryDisplayName(entry);

  return (
    <motion.li variants={fadeSlideUp} className="h-full min-w-0">
      <motion.div
        className="flex h-full flex-col gap-1 rounded-2xl bg-white p-2 shadow-md ring-1 ring-slate-100/80"
        whileHover={{ scale: 1.02, y: -2, boxShadow: "0 12px 20px -8px rgb(0 0 0 / 0.1)" }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
      >
        <div className="flex items-stretch gap-1">
          <Link
            href={lp(`/tool/${entry.toolSlug}?restore=${entry.id}`)}
            prefetch
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-slate-50"
          >
            <motion.span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500"
              variants={toolIconHover}
              initial="rest"
              whileHover="hover"
            >
              <Icon className="h-5 w-5" strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
            </motion.span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {displayName}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {entry.toolName} · {entry.resultSummary}
              </span>
              <span className="mt-0.5 block text-[11px] text-slate-400">
                {formatHistoryDate(entry.timestamp)}
              </span>
            </span>
          </Link>
          <motion.button
            type="button"
            aria-label={t("recent.delete", { name: displayName })}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(entry.id)}
            className="flex shrink-0 items-center justify-center rounded-xl px-2.5 text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>

        <button
          type="button"
          onClick={onExpand}
          aria-expanded={expanded}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-blue-600 transition-colors duration-200 hover:bg-blue-50"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
          {t("recent.expand")}
        </button>
      </motion.div>
    </motion.li>
  );
}

function RecentCalculationModal({
  entry,
  onClose,
}: {
  entry: CalculationHistoryEntry | null;
  onClose: () => void;
}) {
  const { t } = useTranslation([
    "common",
    "loveCalculator",
    "relationshipDepth",
    "businessPartnership",
    "pocketMoney",
    "dogOwnership",
    "parentRespect",
    "strangerSharing",
    "mentalHealth",
    "physicalHealth",
    "calorieBurn",
  ]);
  const dir = useLocaleDirection();
  const lp = useLocalizedPath();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = entry !== null;

  const tCommon: TranslateFn = (key, options) =>
    t(key, { ns: "common", ...options });
  const tLove: TranslateFn = (key, options) =>
    t(key, { ns: "loveCalculator", ...options });
  const tRel: TranslateFn = (key, options) =>
    t(key, { ns: "relationshipDepth", ...options });
  const tBiz: TranslateFn = (key, options) =>
    t(key, { ns: "businessPartnership", ...options });
  const tPocket: TranslateFn = (key, options) =>
    t(key, { ns: "pocketMoney", ...options });
  const tDog: TranslateFn = (key, options) =>
    t(key, { ns: "dogOwnership", ...options });
  const tParent: TranslateFn = (key, options) =>
    t(key, { ns: "parentRespect", ...options });
  const tStranger: TranslateFn = (key, options) =>
    t(key, { ns: "strangerSharing", ...options });
  const tMental: TranslateFn = (key, options) =>
    t(key, { ns: "mentalHealth", ...options });
  const tPhysical: TranslateFn = (key, options) =>
    t(key, { ns: "physicalHealth", ...options });
  const tCalorie: TranslateFn = (key, options) =>
    t(key, { ns: "calorieBurn", ...options });

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const rows = entry
    ? buildDetailRows(entry, tCommon, tLove, [
        tRel,
        tBiz,
        tPocket,
        tDog,
        tParent,
        tStranger,
        tMental,
        tPhysical,
        tCalorie,
      ])
    : [];
  const Icon = entry ? getToolIcon(entry.toolSlug) : null;
  const displayName = entry ? getEntryDisplayName(entry) : "";

  return (
    <AnimatePresence>
      {open && entry && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]"
            aria-label={tCommon("recent.close")}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex max-h-[min(88vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl ring-1 ring-slate-200/80"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                {Icon && (
                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                    <Icon className="h-5 w-5" strokeWidth={ICON_STROKE_WIDTH} />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="label-caption text-blue-500">
                    {tCommon("recent.expandedCaption")}
                  </p>
                  <h3
                    id={titleId}
                    className="mt-1 truncate text-lg font-semibold text-slate-900"
                  >
                    {displayName}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {entry.toolName} · {formatHistoryDate(entry.timestamp)}
                  </p>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={tCommon("recent.close")}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-5 w-5" strokeWidth={ICON_STROKE_WIDTH} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4">
                <p className="label-caption mb-1 text-blue-600">
                  {tCommon("recent.resultLabel")}
                </p>
                <p className="text-base font-semibold leading-relaxed text-slate-900">
                  {entry.resultSummary}
                </p>
              </div>

              {rows.length > 0 && (
                <div className="mt-5">
                  <p className="label-caption mb-3 text-slate-400">
                    {tCommon("recent.detailsLabel")}
                  </p>
                  <dl className="space-y-3">
                    {rows.map((row) => (
                      <div
                        key={row.label}
                        className="rounded-xl bg-slate-50 px-3.5 py-3 ring-1 ring-slate-100"
                      >
                        <dt className="text-xs font-medium text-slate-500">
                          {row.label}
                        </dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">
              <Link
                href={lp(`/tool/${entry.toolSlug}?restore=${entry.id}`)}
                className="btn-primary inline-flex flex-1 items-center justify-center gap-2 sm:flex-none"
                onClick={onClose}
              >
                <ExternalLink className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
                {tCommon("recent.openInTool")}
              </Link>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                {tCommon("recent.close")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
