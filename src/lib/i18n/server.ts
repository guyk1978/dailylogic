import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/settings";

/** Validate and return the locale route param for server components. */
export async function getRouteLocale(
  params: Promise<{ locale: string }>,
): Promise<AppLocale> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  return locale;
}
