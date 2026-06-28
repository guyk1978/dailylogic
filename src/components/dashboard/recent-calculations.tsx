"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  buildRestoreUrl,
  formatHistoryDate,
  getEntryDisplayName,
  type CalculationHistoryEntry,
} from "@/lib/calculation-history";
import { getToolIcon, ICON_STROKE_WIDTH } from "@/lib/tool-icons";
import { fadeSlideUp, staggerList, toolIconHover } from "@/lib/motion-presets";
import { useCalculationHistory } from "@/hooks/use-calculation-history";

export function RecentCalculations() {
  const { t } = useTranslation("common");
  const { history, isHydrated, clearHistory, removeEntry } = useCalculationHistory();

  if (!isHydrated || history.length === 0) return null;

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
        className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1"
        variants={staggerList}
        initial="hidden"
        animate="show"
      >
        {history.map((entry) => (
          <RecentCalculationItem
            key={entry.id}
            entry={entry}
            onDelete={removeEntry}
          />
        ))}
      </motion.ul>
    </section>
  );
}

function RecentCalculationItem({
  entry,
  onDelete,
}: {
  entry: CalculationHistoryEntry;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation("common");
  const Icon = getToolIcon(entry.toolSlug);
  const displayName = getEntryDisplayName(entry);

  return (
    <motion.li variants={fadeSlideUp} className="min-w-[260px] shrink-0 sm:min-w-[300px]">
      <motion.div
        className="flex items-stretch gap-1 rounded-2xl bg-white p-2 shadow-md ring-1 ring-slate-100/80"
        whileHover={{ scale: 1.02, y: -2, boxShadow: "0 12px 20px -8px rgb(0 0 0 / 0.1)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
      >
        <Link
          href={buildRestoreUrl(entry.toolSlug, entry.id)}
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
      </motion.div>
    </motion.li>
  );
}
