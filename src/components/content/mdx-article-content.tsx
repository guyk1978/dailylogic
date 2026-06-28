"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocaleDirection } from "@/hooks/use-locale-direction";

interface MdxArticleContentProps {
  children: ReactNode;
}

/** Wraps server-compiled MDX so it inherits the active locale and RTL/LTR direction. */
export function MdxArticleContent({ children }: MdxArticleContentProps) {
  const { i18n } = useTranslation("common");
  const dir = useLocaleDirection();

  return (
    <article
      className="prose-content border-t border-slate-100 pt-10"
      dir={dir}
      lang={i18n.language}
    >
      {children}
    </article>
  );
}
