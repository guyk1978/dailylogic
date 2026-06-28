import { notFound } from "next/navigation";
import { ToolPageContent } from "@/components/tools/tool-page-content";
import { getAllSlugs, getToolBySlug, type ToolSlug } from "@/lib/tools-registry";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) return { title: "Tool Not Found" };

  return {
    title: tool.meta.name,
    description: tool.meta.description,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  return <ToolPageContent slug={slug as ToolSlug} />;
}
