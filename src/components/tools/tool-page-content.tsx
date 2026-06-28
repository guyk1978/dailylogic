"use client";

import { usePathname } from "next/navigation";
import { ToolPageMotion } from "@/components/layout/tool-page-motion";
import { ToolJsonLd } from "@/components/seo/tool-json-ld";
import { ToolSeoContent } from "@/components/seo/tool-seo-content";
import { ToolRenderer } from "@/components/tool-renderer";
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
      {seo && <ToolJsonLd landing={seo} pageUrl={pageUrl} />}

      <ToolPageMotion>
        <div className="mb-10">
          <p className="label-caption mb-3 text-blue-500">{category.label}</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {tool.name}
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            {seo?.heroDescription ?? tool.description}
          </p>

          {tool.tags && tool.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <ToolRenderer slug={slug} />
        </div>

        {seo?.sections && <ToolSeoContent sections={seo.sections} />}
      </ToolPageMotion>
    </main>
  );
}
