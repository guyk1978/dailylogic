import type { ToolLandingContentSection } from "@/lib/content/types";

interface ToolSeoContentProps {
  sections: ToolLandingContentSection[];
}

export function ToolSeoContent({ sections }: ToolSeoContentProps) {
  if (sections.length === 0) return null;

  return (
    <section className="mt-14 border-t border-slate-100 pt-12" aria-label="About this tool">
      <div className="prose-content max-w-3xl space-y-10">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="mb-4 text-base leading-relaxed text-slate-600 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
