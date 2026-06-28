"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/provider";
import { useLocaleDirection } from "@/hooks/use-locale-direction";
import type { InfoPageKey } from "@/lib/info-pages";

interface InfoSection {
  title: string;
  paragraphs: string[];
  email?: string;
}

interface InfoPageContentProps {
  pageKey: InfoPageKey;
}

export function InfoPageContent({ pageKey }: InfoPageContentProps) {
  const { t } = useTranslation("pages");
  const dir = useLocaleDirection();

  const sectionOrder = t(`${pageKey}.sectionOrder`, {
    returnObjects: true,
  }) as string[];

  const sections = t(`${pageKey}.sections`, {
    returnObjects: true,
  }) as Record<string, InfoSection>;

  const contactEmail = pageKey === "contact" ? t(`${pageKey}.email`) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14" dir={dir}>
      <header className="mb-12">
        <p className="label-caption mb-3 text-blue-500">{t(`${pageKey}.caption`)}</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {t(`${pageKey}.title`)}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-600">
          {t(`${pageKey}.description`)}
        </p>
      </header>

      <div className="space-y-8">
        {sectionOrder.map((sectionKey) => {
          const section = sections[sectionKey];
          if (!section) return null;

          return (
            <section
              key={sectionKey}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8"
            >
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <div className="prose-content mt-4">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {section.email && (
                <p className="mt-4">
                  <Link
                    href={`mailto:${section.email}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {section.email}
                  </Link>
                </p>
              )}
            </section>
          );
        })}

        {contactEmail && (
          <section className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 text-center sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              {t("contact.emailLabel")}
            </p>
            <Link
              href={`mailto:${contactEmail}`}
              className="mt-3 inline-block text-lg font-semibold text-blue-600 hover:text-blue-700"
            >
              {contactEmail}
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
