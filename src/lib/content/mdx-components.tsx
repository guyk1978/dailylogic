import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { ToolEmbed } from "@/components/content/tool-embed";
import type { ToolSlug } from "@/lib/tools-registry";

export function getMdxComponents(): MDXComponents {
  return {
    h2: (props) => (
      <h2
        className="mb-4 mt-10 text-2xl font-semibold tracking-tight text-slate-900"
        {...props}
      />
    ),
    h3: (props) => (
      <h3 className="mb-3 mt-8 text-xl font-semibold text-slate-900" {...props} />
    ),
    p: (props) => (
      <p className="mb-5 leading-relaxed text-slate-600" {...props} />
    ),
    ul: (props) => (
      <ul className="mb-6 list-disc space-y-2 ps-6 text-slate-600" {...props} />
    ),
    ol: (props) => (
      <ol
        className="mb-6 list-decimal space-y-2 ps-6 text-slate-600"
        {...props}
      />
    ),
    li: (props) => <li className="leading-relaxed" {...props} />,
    a: (props) => (
      <a
        className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-2 transition hover:text-blue-700 hover:decoration-blue-400"
        {...props}
      />
    ),
    blockquote: (props) => (
      <blockquote
        className="my-6 border-s-4 border-blue-200 bg-blue-50/50 py-3 pe-4 ps-5 text-slate-700"
        {...props}
      />
    ),
    strong: (props) => (
      <strong className="font-semibold text-slate-800" {...props} />
    ),
    ToolEmbed: ({ slug }: { slug: ToolSlug }) => <ToolEmbed slug={slug} />,
    DelegateOrDoTool: () => <ToolEmbed slug="time-value" />,
    SmartTipAssistantTool: () => <ToolEmbed slug="tip-split" />,
    SmartShoppingAssistantTool: () => <ToolEmbed slug="unit-compare" />,
    Callout: ({
      title,
      children,
    }: {
      title?: string;
      children: React.ReactNode;
    }) => (
      <div className="my-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        {title && (
          <p className="label-caption mb-2 text-blue-500">{title}</p>
        )}
        <div className="text-sm leading-relaxed text-slate-600">{children}</div>
      </div>
    ),
    ContentLink: ({ href, children }: { href: string; children: React.ReactNode }) => (
      <Link
        href={href}
        className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-2 transition hover:text-blue-700"
      >
        {children}
      </Link>
    ),
  };
}
