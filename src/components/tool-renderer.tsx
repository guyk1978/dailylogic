"use client";

import dynamic from "next/dynamic";
import { Suspense, type ComponentType } from "react";
import { motion } from "framer-motion";
import { ToolLoadingSkeleton } from "@/components/tools/tool-loading-skeleton";
import { fadeSlideUp } from "@/lib/motion-presets";
import { toolsRegistry, type ToolSlug } from "@/lib/tools-registry";

const toolComponents = Object.fromEntries(
  toolsRegistry.map(({ meta, loadComponent }) => [
    meta.slug,
    dynamic(loadComponent, { ssr: false, loading: () => <ToolLoadingSkeleton /> }),
  ]),
) as Record<ToolSlug, ComponentType>;

interface ToolRendererProps {
  slug: ToolSlug;
}

export function ToolRenderer({ slug }: ToolRendererProps) {
  const Component = toolComponents[slug];
  return (
    <Suspense fallback={<ToolLoadingSkeleton />}>
      <motion.div
        key={slug}
        variants={fadeSlideUp}
        initial="hidden"
        animate="show"
      >
        <Component />
      </motion.div>
    </Suspense>
  );
}
