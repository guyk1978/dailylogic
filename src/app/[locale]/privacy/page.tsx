import { InfoPageContent } from "@/components/content/info-page-content";
import { getRouteLocale } from "@/lib/i18n/server";
import { getInfoPageMetadata } from "@/lib/seo/info-page-metadata";

export const runtime = "edge";

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PrivacyPageProps) {
  const locale = await getRouteLocale(params);
  return getInfoPageMetadata("privacy", locale);
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  await getRouteLocale(params);
  return <InfoPageContent pageKey="privacy" />;
}
