"use client";

import { useTranslation } from "@/lib/i18n/provider";

interface LegalDisclaimerProps {
  /** Slightly tighter spacing when nested under a tool card */
  compact?: boolean;
  className?: string;
}

export function LegalDisclaimer({
  compact = false,
  className = "",
}: LegalDisclaimerProps) {
  const { t } = useTranslation("common");

  return (
    <p
      role="note"
      className={`text-xs leading-relaxed text-slate-400 ${
        compact ? "mt-4 border-t border-slate-100 pt-4" : ""
      } ${className}`.trim()}
    >
      {t("disclaimer.text")}
    </p>
  );
}
