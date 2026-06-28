import { InfoPageContent } from "@/components/content/info-page-content";
import { getRouteLocale } from "@/lib/i18n/server";
import { getInfoPageMetadata } from "@/lib/seo/info-page-metadata";

export const runtime = "edge";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TermsPageProps) {
  const locale = await getRouteLocale(params);
  return getInfoPageMetadata("terms", locale);
}

export default async function TermsPage({ params }: TermsPageProps) {
  await getRouteLocale(params);
  return <InfoPageContent pageKey="terms" />;
}
