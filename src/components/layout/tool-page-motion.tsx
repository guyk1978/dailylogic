"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { pageEnter } from "@/lib/motion-presets";

export function ToolPageMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageEnter}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}
