import { InfoPageContent } from "@/components/content/info-page-content";
import { getRouteLocale } from "@/lib/i18n/server";
import { getInfoPageMetadata } from "@/lib/seo/info-page-metadata";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps) {
  const locale = await getRouteLocale(params);
  return getInfoPageMetadata("about", locale);
}

export default async function AboutPage({ params }: AboutPageProps) {
  await getRouteLocale(params);
  return <InfoPageContent pageKey="about" />;
}
