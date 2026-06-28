"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  getCategoryAccent,
  getCategoryIconBg,
} from "@/components/dashboard/category-illustrations";
import { useTranslatedCategories, useTranslatedTool } from "@/hooks/use-translated-tools";
import { ICON_STROKE_WIDTH, getToolIcon } from "@/lib/tool-icons";
import { toolCardHover, toolIconHover } from "@/lib/motion-presets";
import type { ToolMeta } from "@/lib/tools-registry";

interface ToolLinkCardProps {
  meta: ToolMeta;
  href?: string;
}

export function ToolLinkCard({ meta, href }: ToolLinkCardProps) {
  const translated = useTranslatedTool(meta.slug);
  const categories = useTranslatedCategories();
  const display = translated ?? meta;
  const categoryLabel = categories[meta.category].label;

  const Icon = getToolIcon(meta.slug);
  const iconColor = getCategoryAccent(meta.category);
  const iconBg = getCategoryIconBg(meta.category);
  const linkHref = href ?? `/tool/${meta.slug}`;

  return (
    <motion.div
      className="h-full"
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={toolCardHover}
    >
      <Link
        href={linkHref}
        prefetch
        className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-100/80 transition-colors duration-300 hover:ring-blue-100"
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
          {display.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
          {display.description}
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
  );
}
