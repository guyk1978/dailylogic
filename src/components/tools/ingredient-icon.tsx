"use client";

import * as LucideIcons from "lucide-react";
import { Circle, type LucideIcon } from "lucide-react";

export function IngredientIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon =
    (LucideIcons as unknown as Record<string, LucideIcon>)[name] ?? Circle;

  return <Icon className={className} aria-hidden />;
}
