"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  CategoryIllustration,
  getCategoryAccent,
  getCategoryIconBg,
} from "@/components/dashboard/category-illustrations";
import { RecentCalculations } from "@/components/dashboard/recent-calculations";
import { useFavorites } from "@/hooks/use-favorites";
import {
  useTranslatedCategories,
  useTranslatedTools,
  type TranslatedToolMeta,
} from "@/hooks/use-translated-tools";
import { ICON_STROKE_WIDTH, getToolIcon } from "@/lib/tool-icons";
import {
  contentCrossfade,
  fadeSlideUp,
  fadeSlideUpSection,
  staggerList,
  toolCardHover,
  toolIconHover,
} from "@/lib/motion-presets";
import { type ToolCategory, type ToolSlug } from "@/lib/tools-registry";

function matchesQuery(
  tool: TranslatedToolMeta,
  query: string,
  categoryLabel: string,
): boolean {
  return (
    tool.name.toLowerCase().includes(query) ||
    tool.description.toLowerCase().includes(query) ||
    tool.category.toLowerCase().includes(query) ||
    categoryLabel.toLowerCase().includes(query) ||
    (tool.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false)
  );
}

interface ToolCardProps {
  meta: TranslatedToolMeta;
  categoryLabel: string;
  isFavorite: boolean;
  onToggleFavorite: (slug: ToolSlug) => void;
}

function ToolCard({
  meta,
  categoryLabel,
  isFavorite,
  onToggleFavorite,
}: ToolCardProps) {
  const { t } = useTranslation("common");
  const Icon = getToolIcon(meta.slug);
  const iconColor = getCategoryAccent(meta.category);
  const iconBg = getCategoryIconBg(meta.category);

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
        className="absolute end-4 top-4 z-10 rounded-full p-2 transition-colors duration-200 hover:bg-blue-50"
      >
        <Heart
          className={`h-5 w-5 transition duration-200 ${
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
          href={`/tool/${meta.slug}`}
          prefetch
          className="group flex h-full flex-col rounded-2xl bg-white p-6 pe-14 ring-1 ring-slate-100/80 transition-colors duration-300 hover:ring-blue-100"
        >
          <motion.div
            className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
            variants={toolIconHover}
          >
            <Icon
              className={`h-5 w-5 ${iconColor}`}
              strokeWidth={ICON_STROKE_WIDTH}
            />
          </motion.div>

          <span className="tag-pill mb-3 w-fit">{categoryLabel}</span>
          <h3 className="text-lg font-semibold text-slate-900 transition-colors duration-200 group-hover:text-blue-600">
            {meta.name}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
            {meta.description}
          </p>
          {meta.tags && meta.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      </motion.div>
    </div>
  );
}

function ToolCardGrid({ children }: { children: ReactNode }) {
  return (
    <motion.ul
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      variants={staggerList}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.ul>
  );
}

function AnimatedToolCard(props: ToolCardProps) {
  return (
    <motion.li variants={fadeSlideUp} className="h-full">
      <ToolCard {...props} />
    </motion.li>
  );
}

export function ToolDashboard() {
  const { t } = useTranslation("common");
  const tools = useTranslatedTools();
  const categories = useTranslatedCategories();
  const [query, setQuery] = useState("");
  const { favorites, isFavorite, toggleFavorite, isHydrated } = useFavorites();

  const normalizedQuery = query.trim().toLowerCase();

  const favoriteTools = useMemo(() => {
    const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));
    return favorites
      .map((slug) => bySlug.get(slug))
      .filter((tool): tool is TranslatedToolMeta => tool !== undefined);
  }, [tools, favorites]);

  const filteredTools = useMemo(() => {
    if (!normalizedQuery) return tools;
    return tools.filter((tool) =>
      matchesQuery(tool, normalizedQuery, categories[tool.category].label),
    );
  }, [tools, normalizedQuery, categories]);

  const filteredFavorites = useMemo(() => {
    if (!normalizedQuery) return favoriteTools;
    return favoriteTools.filter((tool) =>
      matchesQuery(tool, normalizedQuery, categories[tool.category].label),
    );
  }, [favoriteTools, normalizedQuery, categories]);

  const groupedTools = useMemo(() => {
    if (normalizedQuery) return null;

    const favoriteSlugs = new Set(favorites);

    return (Object.keys(categories) as ToolCategory[])
      .map((category) => ({
        category,
        label: categories[category].label,
        description: categories[category].description,
        tools: tools.filter(
          (tool) =>
            tool.category === category && !favoriteSlugs.has(tool.slug),
        ),
      }))
      .filter((section) => section.tools.length > 0);
  }, [tools, normalizedQuery, favorites, categories]);

  const renderToolCard = (meta: TranslatedToolMeta) => (
    <AnimatedToolCard
      key={meta.slug}
      meta={meta}
      categoryLabel={categories[meta.category].label}
      isFavorite={isFavorite(meta.slug)}
      onToggleFavorite={toggleFavorite}
    />
  );

  const contentKey = normalizedQuery || "browse";

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
      </motion.header>

      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <label htmlFor="tool-search" className="label-caption mb-2 block">
          {t("dashboard.searchLabel")}
        </label>
        <input
          id="tool-search"
          type="search"
          placeholder={t("dashboard.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field py-3.5 text-base shadow-md"
          autoComplete="off"
        />
      </motion.div>

      {filteredTools.length === 0 ? (
        <motion.div
          className="rounded-2xl bg-white px-6 py-16 text-center shadow-md"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-lg font-medium text-slate-700">
            {t("dashboard.noToolsTitle")}
          </p>
          <p className="mt-2 text-sm text-slate-500">{t("dashboard.noToolsHint")}</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={contentKey}
            className="space-y-14"
            variants={contentCrossfade}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {isHydrated && filteredFavorites.length > 0 && !normalizedQuery && (
              <motion.section variants={fadeSlideUpSection}>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {t("dashboard.favoritesTitle")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("dashboard.favoritesDescription")}
                  </p>
                </div>
                <ToolCardGrid>
                  {filteredFavorites.map(renderToolCard)}
                </ToolCardGrid>
              </motion.section>
            )}

            {!normalizedQuery && <RecentCalculations />}

            {normalizedQuery ? (
              <motion.section variants={fadeSlideUpSection}>
                <p className="label-caption mb-4">
                  {t("dashboard.results", { count: filteredTools.length })}
                </p>
                <ToolCardGrid>{filteredTools.map(renderToolCard)}</ToolCardGrid>
              </motion.section>
            ) : (
              groupedTools?.map(
                ({ category, label, description, tools: sectionTools }) => (
                  <motion.section key={category} variants={fadeSlideUpSection}>
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                          {label}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {description}
                        </p>
                      </div>
                      <CategoryIllustration category={category} />
                    </div>
                    <ToolCardGrid>{sectionTools.map(renderToolCard)}</ToolCardGrid>
                  </motion.section>
                ),
              )
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <footer className="mt-20 pt-8 text-center text-xs text-slate-400">
        {t("app.footer")}
      </footer>
    </div>
  );
}
