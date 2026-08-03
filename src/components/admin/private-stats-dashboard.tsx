"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  Eye,
  Flag,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/provider";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import {
  clearPrivateStats,
  downloadPrivateStatsFile,
  getPrivateStatsOverview,
  readPrivateStatsStore,
  summarizeRegisteredTools,
  type PrivateStatsOverview,
  type ToolStatsSummary,
} from "@/lib/analytics/private-stats";
import { getAllSlugs, type ToolSlug } from "@/lib/tools-registry";
import { ICON_STROKE_WIDTH } from "@/lib/tool-icons";

function formatRate(rate: number | null): string {
  if (rate == null) return "—";
  return `${Math.round(rate * 100)}%`;
}

function formatUpdatedAt(ts: number | null, locale: string): string {
  if (!ts) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function topAnswersLine(summary: ToolStatsSummary): string {
  const top = summary.popularQuestions.slice(0, 3);
  if (top.length === 0) return "—";
  return top
    .map((q) => {
      const opt = q.topOption ?? "?";
      return `${q.questionId}: ${opt} (${q.topOptionCount})`;
    })
    .join(" · ");
}

export function PrivateStatsDashboard() {
  const { t, i18n } = useTranslation(["pages", "common"]);
  const dir = useLocaleDirection();
  const locale = i18n.language;

  const [overview, setOverview] = useState<PrivateStatsOverview | null>(null);
  const [rows, setRows] = useState<ToolStatsSummary[]>([]);
  const [expanded, setExpanded] = useState<ToolSlug | null>(null);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    const store = readPrivateStatsStore();
    setOverview(getPrivateStatsOverview(store));
    setRows(summarizeRegisteredTools(getAllSlugs() as ToolSlug[], store));
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
  }, [refresh]);

  useEffect(() => {
    if (resetStep === 0) return;
    const id = window.setTimeout(() => setResetStep(0), 8000);
    return () => window.clearTimeout(id);
  }, [resetStep]);

  const kpis = useMemo(() => {
    if (!overview) return [];
    return [
      {
        key: "opens",
        label: t("pages:adminStats.kpi.opens"),
        value: overview.opens,
        icon: Eye,
        tone: "bg-sky-50 text-sky-700 ring-sky-100",
      },
      {
        key: "started",
        label: t("pages:adminStats.kpi.started"),
        value: overview.started,
        icon: Play,
        tone: "bg-teal-50 text-teal-700 ring-teal-100",
      },
      {
        key: "completed",
        label: t("pages:adminStats.kpi.completed"),
        value: overview.completed,
        icon: Flag,
        tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      },
      {
        key: "rate",
        label: t("pages:adminStats.kpi.completionRate"),
        value: formatRate(overview.completionRate),
        icon: BarChart3,
        tone: "bg-orange-50 text-orange-800 ring-orange-100",
      },
    ] as const;
  }, [overview, t]);

  const handleDownload = () => {
    downloadPrivateStatsFile();
  };

  const handleReset = () => {
    if (resetStep === 0) {
      setResetStep(1);
      return;
    }
    if (resetStep === 1) {
      setResetStep(2);
      return;
    }
    clearPrivateStats();
    setResetStep(0);
    setExpanded(null);
    refresh();
  };

  const resetLabel =
    resetStep === 0
      ? t("pages:adminStats.actions.reset")
      : resetStep === 1
        ? t("pages:adminStats.actions.resetConfirm")
        : t("pages:adminStats.actions.resetFinal");

  return (
    <main className="mx-auto max-w-5xl px-6 pb-20 pt-10" dir={dir}>
      <div className="mb-8">
        <p className="label-caption text-slate-500">
          {t("pages:adminStats.badge")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("pages:adminStats.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          {t("pages:adminStats.description")}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {t("pages:adminStats.privacyNote")}
        </p>
        {hydrated && overview && (
          <p className="mt-2 text-xs text-slate-400">
            {t("pages:adminStats.updatedAt", {
              value: formatUpdatedAt(overview.updatedAt, locale),
            })}
            {" · "}
            {t("pages:adminStats.toolsActive", {
              count: overview.toolsWithActivity,
            })}
          </p>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
          {t("pages:adminStats.actions.download")}
        </button>
        <button
          type="button"
          onClick={refresh}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
          {t("pages:adminStats.actions.refresh")}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ring-1 ${
            resetStep === 0
              ? "bg-white text-rose-600 ring-rose-100 hover:bg-rose-50"
              : resetStep === 1
                ? "bg-rose-50 text-rose-700 ring-rose-200"
                : "bg-rose-600 text-white ring-rose-600"
          }`}
        >
          <Trash2 className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} />
          {resetLabel}
        </button>
      </div>

      {!hydrated ? (
        <p className="text-sm text-slate-500">{t("pages:adminStats.loading")}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.key}
                  className={`rounded-2xl p-4 shadow-sm ring-1 ${kpi.tone}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                      {kpi.label}
                    </p>
                    <Icon
                      className="h-4 w-4 opacity-70"
                      strokeWidth={ICON_STROKE_WIDTH}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight">
                    {kpi.value}
                  </p>
                </div>
              );
            })}
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">
              {t("pages:adminStats.table.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("pages:adminStats.table.subtitle")}
            </p>

            <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-md ring-1 ring-slate-100">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">{t("pages:adminStats.table.tool")}</th>
                    <th className="px-4 py-3">{t("pages:adminStats.table.opens")}</th>
                    <th className="px-4 py-3">{t("pages:adminStats.table.started")}</th>
                    <th className="px-4 py-3">{t("pages:adminStats.table.completed")}</th>
                    <th className="px-4 py-3">{t("pages:adminStats.table.rate")}</th>
                    <th className="px-4 py-3">{t("pages:adminStats.table.topAnswers")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const nameKey = `tools.${row.toolSlug}.name`;
                    const name = t(nameKey, { ns: "common" });
                    const isOpen = expanded === row.toolSlug;
                    return (
                      <tr
                        key={row.toolSlug}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-4 py-3 align-top">
                          <button
                            type="button"
                            className="text-start font-semibold text-slate-900 hover:text-blue-600"
                            onClick={() =>
                              setExpanded(isOpen ? null : row.toolSlug)
                            }
                            aria-expanded={isOpen}
                          >
                            {name === nameKey ? row.toolSlug : name}
                          </button>
                          {isOpen && (
                            <div className="mt-3 space-y-2 text-xs text-slate-600">
                              {row.modes.length > 0 && (
                                <p>
                                  <span className="font-semibold text-slate-700">
                                    {t("pages:adminStats.detail.modes")}:{" "}
                                  </span>
                                  {row.modes
                                    .map(
                                      (m) =>
                                        `${m.mode} ${m.started}/${m.completed}`,
                                    )
                                    .join(" · ")}
                                </p>
                              )}
                              {row.topOutcomes.length > 0 && (
                                <p>
                                  <span className="font-semibold text-slate-700">
                                    {t("pages:adminStats.detail.outcomes")}:{" "}
                                  </span>
                                  {row.topOutcomes
                                    .slice(0, 5)
                                    .map((o) => `${o.outcome} (${o.count})`)
                                    .join(" · ")}
                                </p>
                              )}
                              {row.popularQuestions.length > 0 ? (
                                <ul className="space-y-1 rounded-xl bg-slate-50 p-3">
                                  {row.popularQuestions.slice(0, 8).map((q) => (
                                    <li key={q.questionId}>
                                      <span className="font-medium text-slate-800">
                                        {q.questionId}
                                      </span>
                                      {" — "}
                                      {t("pages:adminStats.detail.answered", {
                                        count: q.answered,
                                      })}
                                      {q.topOption != null && (
                                        <>
                                          {" · "}
                                          {t("pages:adminStats.detail.topOption", {
                                            option: q.topOption,
                                            count: q.topOptionCount,
                                          })}
                                        </>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-slate-400">
                                  {t("pages:adminStats.detail.noAnswers")}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums text-slate-700">
                          {row.opens}
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums text-slate-700">
                          {row.started}
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums text-slate-700">
                          {row.completed}
                        </td>
                        <td className="px-4 py-3 align-top tabular-nums text-slate-700">
                          {formatRate(row.completionRate)}
                        </td>
                        <td className="max-w-xs px-4 py-3 align-top text-xs leading-relaxed text-slate-500">
                          {topAnswersLine(row)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
