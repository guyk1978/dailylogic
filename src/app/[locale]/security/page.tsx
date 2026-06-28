import { InfoPageContent } from "@/components/content/info-page-content";
import { getRouteLocale } from "@/lib/i18n/server";
import { getInfoPageMetadata } from "@/lib/seo/info-page-metadata";

interface SecurityPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: SecurityPageProps) {
  const locale = await getRouteLocale(params);
  return getInfoPageMetadata("security", locale);
}

export default async function SecurityPage({ params }: SecurityPageProps) {
  await getRouteLocale(params);
  return <InfoPageContent pageKey="security" />;
}
