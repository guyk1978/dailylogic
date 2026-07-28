import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { LocaleLayoutShell } from "@/components/layout/locale-layout-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { I18nProvider } from "@/lib/i18n/provider";
import { localeResources } from "@/lib/i18n/resources";
import { isAppLocale, locales, type AppLocale } from "@/lib/i18n/settings";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) return {};

  const locale = raw as AppLocale;
  const { app } = localeResources[locale].common;

  return {
    applicationName: app.name,
    title: {
      default: `${app.name} — ${app.tagline}`,
      template: `%s · ${app.name}`,
    },
    description: app.metaDescription,
    appleWebApp: {
      capable: true,
      title: app.name,
      statusBarStyle: "default",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  return (
    <I18nProvider locale={locale}>
      <LocaleLayoutShell>
        <AppHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </LocaleLayoutShell>
    </I18nProvider>
  );
}
