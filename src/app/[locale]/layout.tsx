import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { LocaleLayoutShell } from "@/components/layout/locale-layout-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { I18nProvider } from "@/lib/i18n/provider";
import { isAppLocale, locales } from "@/lib/i18n/settings";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
