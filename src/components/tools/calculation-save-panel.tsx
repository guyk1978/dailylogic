"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCalculationHistory } from "@/hooks/use-calculation-history";
import type { ToolSlug } from "@/lib/tools-registry";

interface CalculationSavePanelProps {
  toolSlug: ToolSlug;
  toolName?: string;
  inputs: Record<string, unknown>;
  resultSummary: string;
  saveName: string;
  onSaveNameChange: (name: string) => void;
}

export function CalculationSavePanel({
  toolSlug,
  toolName,
  inputs,
  resultSummary,
  saveName,
  onSaveNameChange,
}: CalculationSavePanelProps) {
  const { t } = useTranslation("common");
  const resolvedToolName = toolName ?? t(`tools.${toolSlug}.name`);
  const { addEntry } = useCalculationHistory();
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = () => {
    addEntry({
      toolSlug,
      toolName: resolvedToolName,
      name: saveName,
      inputs,
      resultSummary,
    });
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100 sm:p-5">
      <label htmlFor={`save-name-${toolSlug}`} className="label-caption mb-2 block">
        {t("save.optionalLabel")}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          id={`save-name-${toolSlug}`}
          type="text"
          placeholder={t("save.namePlaceholder")}
          value={saveName}
          onChange={(e) => onSaveNameChange(e.target.value)}
          className="input-field flex-1 py-2.5 text-base shadow-sm"
        />
        <button
          type="button"
          className="btn-primary shrink-0 transition duration-200"
          onClick={handleSave}
        >
          {justSaved ? t("save.saved") : t("save.saveButton")}
        </button>
      </div>
    </div>
  );
}
