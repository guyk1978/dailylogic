import {
  Briefcase,
  ChefHat,
  Coins,
  PieChart,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";
import type { ToolSlug } from "@/lib/tools-registry";

/** Consistent stroke weight across dashboard icons */
export const ICON_STROKE_WIDTH = 1.75;

export const TOOL_ICONS: Record<ToolSlug, LucideIcon> = {
  "budget-simple": PieChart,
  "time-value": Briefcase,
  "tip-split": Coins,
  "recipe-adjuster": ChefHat,
  "unit-compare": ShoppingBasket,
};

export function getToolIcon(slug: ToolSlug): LucideIcon {
  return TOOL_ICONS[slug];
}
