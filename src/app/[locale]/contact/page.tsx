import { InfoPageContent } from "@/components/content/info-page-content";
import { getRouteLocale } from "@/lib/i18n/server";
import { getInfoPageMetadata } from "@/lib/seo/info-page-metadata";

export const runtime = "edge";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps) {
  const locale = await getRouteLocale(params);
  return getInfoPageMetadata("contact", locale);
}

export default async function ContactPage({ params }: ContactPageProps) {
  await getRouteLocale(params);
  return <InfoPageContent pageKey="contact" />;
}
