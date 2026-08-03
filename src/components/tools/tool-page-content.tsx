"use client";

import { usePathname } from "next/navigation";
import { PrivateStatsBeacon } from "@/components/analytics/private-stats-beacon";
import { ToolPageMotion } from "@/components/layout/tool-page-motion";
import { ToolJsonLd } from "@/components/seo/tool-json-ld";
import { ToolSeoContent } from "@/components/seo/tool-seo-content";
import { ShareToolButton } from "@/components/tools/share-tool-button";
import { ToolRenderer } from "@/components/tool-renderer";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { useTranslatedCategories, useTranslatedTool } from "@/hooks/use-translated-tools";
import { useToolSeo } from "@/hooks/use-tool-seo";
import { getToolBySlug, type ToolSlug } from "@/lib/tools-registry";

export function ToolPageContent({ slug }: { slug: ToolSlug }) {
  const tool = useTranslatedTool(slug);
  const categories = useTranslatedCategories();
  const seo = useToolSeo(slug);
  const pathname = usePathname();

  if (!tool || !getToolBySlug(slug)) {
    return null;
  }

  const category = categories[tool.category];
  const pageUrl =
    typeof window !== "undefined"
      ? window.location.origin + pathname
      : `https://dailylogic.app${pathname}`;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-20 pt-10">
      <PrivateStatsBeacon toolSlug={slug} />
      {seo && <ToolJsonLd landing={seo} pageUrl={pageUrl} />}

      <ToolPageMotion>
        <div className="mb-10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="label-caption text-blue-500">{category.label}</p>
            <ShareToolButton
              slug={slug}
              name={tool.name}
              description={seo?.heroDescription ?? tool.description}
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {tool.name}
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            {seo?.heroDescription ?? tool.description}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <ToolRenderer slug={slug} />
          <LegalDisclaimer compact />
        </div>

        {seo?.sections && <ToolSeoContent sections={seo.sections} />}
      </ToolPageMotion>
    </main>
  );
}
