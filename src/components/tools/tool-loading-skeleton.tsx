"use client";

import { motion } from "framer-motion";

export function ToolLoadingSkeleton() {
  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      aria-hidden
    >
      <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-10 w-36 animate-pulse rounded-xl bg-blue-100/60" />
    </motion.div>
  );
}
