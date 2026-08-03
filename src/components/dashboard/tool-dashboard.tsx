"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/provider";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import { useLocalizedPath } from "@/hooks/use-localized-path";
import {
  getCategoryAccent,
  getCategoryIconBg,
} from "@/components/dashboard/category-illustrations";
import { DailyMiniCrossword } from "@/components/dashboard/daily-mini-crossword";
import { RecentCalculations } from "@/components/dashboard/recent-calculations";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { useFavorites } from "@/hooks/use-favorites";
import {
  useTranslatedCategories,
  useTranslatedTools,
  type TranslatedToolMeta,
} from "@/hooks/use-translated-tools";
import { ICON_STROKE_WIDTH, getToolIcon } from "@/lib/tool-icons";
import {
  fadeSlideUp,
  staggerList,
  toolCardHover,
  toolIconHover,
} from "@/lib/motion-presets";
import { type ToolSlug } from "@/lib/tools-registry";

const CARD_WASH: Record<string, string> = {
  finance:
    "from-blue-50/90 via-white to-white hover:ring-blue-200/80",
  kitchen:
    "from-amber-50/90 via-white to-white hover:ring-amber-200/80",
  shopping:
    "from-emerald-50/90 via-white to-white hover:ring-emerald-200/80",
  life:
    "from-rose-50/90 via-white to-white hover:ring-rose-200/80",
};

function ToolCard({
  meta,
  categoryLabel,
  isFavorite,
  onToggleFavorite,
}: {
  meta: TranslatedToolMeta;
  categoryLabel: string;
  isFavorite: boolean;
  onToggleFavorite: (slug: ToolSlug) => void;
}) {
  const { t } = useTranslation("common");
  const lp = useLocalizedPath();
  const dir = useLocaleDirection();
  const Icon = getToolIcon(meta.slug);
  const iconColor = getCategoryAccent(meta.category);
  const iconBg = getCategoryIconBg(meta.category);
  const wash = CARD_WASH[meta.category] ?? CARD_WASH.finance;
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="relative h-full">
      <motion.button
        type="button"
        aria-label={
          isFavorite
            ? t("dashboard.removeFavorite", { name: meta.name })
            : t("dashboard.addFavorite", { name: meta.name })
        }
        aria-pressed={isFavorite}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(meta.slug);
        }}
        className="absolute end-3.5 top-3.5 z-10 rounded-full bg-white/80 p-2 shadow-sm ring-1 ring-slate-100/80 backdrop-blur-sm transition-colors duration-200 hover:bg-white"
      >
        <Heart
          className={`h-4 w-4 transition duration-200 ${
            isFavorite
              ? "fill-blue-500 text-blue-500"
              : "text-slate-300 hover:text-blue-400"
          }`}
          strokeWidth={ICON_STROKE_WIDTH}
        />
      </motion.button>

      <motion.div
        className="h-full"
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={toolCardHover}
      >
        <Link
          href={lp(`/tool/${meta.slug}`)}
          prefetch
          className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br p-6 pe-12 shadow-sm ring-1 ring-slate-200/70 transition duration-300 hover:shadow-md ${wash}`}
        >
          <div
            className="pointer-events-none absolute -end-8 -top-10 h-28 w-28 rounded-full bg-white/50 blur-2xl"
            aria-hidden
          />

          <motion.div
            className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1 ring-white/80 ${iconBg}`}
            variants={toolIconHover}
          >
            <Icon
              className={`h-5 w-5 ${iconColor}`}
              strokeWidth={ICON_STROKE_WIDTH}
            />
          </motion.div>

          <span
            className={`relative mb-3 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${iconBg} ${iconColor}`}
          >
            {categoryLabel}
          </span>

          <h3 className="relative text-xl font-semibold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-blue-700">
            {meta.name}
          </h3>
          <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-500">
            {meta.description}
          </p>

          <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition duration-200 group-hover:gap-2.5 group-hover:text-blue-600">
            {t("dashboard.openTool")}
            <Arrow className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

export function ToolDashboard() {
  const { t } = useTranslation("common");
  const tools = useTranslatedTools();
  const categories = useTranslatedCategories();
  const { favorites, isFavorite, toggleFavorite, isHydrated } = useFavorites();

  const orderedTools = useMemo(() => {
    if (!isHydrated || favorites.length === 0) return tools;
    const favoriteSet = new Set(favorites);
    const favored = favorites
      .map((slug) => tools.find((tool) => tool.slug === slug))
      .filter((tool): tool is TranslatedToolMeta => tool !== undefined);
    const rest = tools.filter((tool) => !favoriteSet.has(tool.slug));
    return [...favored, ...rest];
  }, [tools, favorites, isHydrated]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
      <motion.header
        className="mb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <p className="label-caption mb-3 text-blue-500">{t("app.heroCaption")}</p>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          {t("app.name")}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
          {t("app.heroDescription")}
        </p>
        <div className="mt-6">
          <InstallAppButton variant="banner" />
        </div>
      </motion.header>

      <div className="space-y-12">
        <DailyMiniCrossword />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50/70 via-white to-emerald-50/40 p-5 shadow-sm ring-1 ring-slate-200/60 sm:p-7">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 12% 18%, rgba(59,130,246,0.12), transparent 34%), radial-gradient(circle at 88% 12%, rgba(16,185,129,0.10), transparent 30%), radial-gradient(circle at 70% 85%, rgba(245,158,11,0.10), transparent 28%)",
              }}
              aria-hidden
            />

            <div className="relative mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {t("dashboard.toolsTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("dashboard.toolsDescription")}
                </p>
              </div>
              <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200/70">
                {t("dashboard.toolsCount", { count: tools.length })}
              </p>
            </div>

            <motion.ul
              className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              variants={staggerList}
              initial="hidden"
              animate="show"
            >
              {orderedTools.map((meta) => (
                <motion.li key={meta.slug} variants={fadeSlideUp} className="h-full">
                  <ToolCard
                    meta={meta}
                    categoryLabel={categories[meta.category].label}
                    isFavorite={isFavorite(meta.slug)}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </motion.section>

        <RecentCalculations />
      </div>
    </div>
  );
}
