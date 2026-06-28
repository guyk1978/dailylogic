"use client";

import type { ReactNode } from "react";
import { useAppLocale, useLocaleDirection } from "@/hooks/use-locale-direction";

interface LocaleLayoutShellProps {
  children: ReactNode;
}

/** High-level RTL/LTR container so logical Tailwind utilities flip correctly. */
export function LocaleLayoutShell({ children }: LocaleLayoutShellProps) {
  const dir = useLocaleDirection();
  const locale = useAppLocale();

  return (
    <div dir={dir} lang={locale} className="flex min-h-screen flex-col">
      {children}
    </div>
  );
}
