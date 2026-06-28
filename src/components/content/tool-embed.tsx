"use client";

import { ToolRenderer } from "@/components/tool-renderer";
import type { ToolSlug } from "@/lib/tools-registry";

interface ToolEmbedProps {
  slug: ToolSlug;
}

export function ToolEmbed({ slug }: ToolEmbedProps) {
  return (
    <div className="my-10 overflow-hidden rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-100 sm:p-8">
      <ToolRenderer slug={slug} />
    </div>
  );
}
