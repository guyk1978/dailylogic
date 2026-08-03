import type { Metadata } from "next";
import { PrivateStatsDashboard } from "@/components/admin/private-stats-dashboard";
import { getRouteLocale } from "@/lib/i18n/server";
import { localeResources } from "@/lib/i18n/resources";
import type { AppLocale } from "@/lib/i18n/settings";

export const runtime = "edge";

interface AdminStatsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AdminStatsPageProps): Promise<Metadata> {
  const locale = (await getRouteLocale(params)) as AppLocale;
  const copy = localeResources[locale].pages.adminStats;

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default async function AdminStatsPage({ params }: AdminStatsPageProps) {
  await getRouteLocale(params);
  return <PrivateStatsDashboard />;
}
