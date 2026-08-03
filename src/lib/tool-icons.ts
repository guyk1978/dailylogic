import {
  Briefcase,
  BriefcaseBusiness,
  ChefHat,
  Coins,
  Dog,
  Flame,
  Heart,
  HeartHandshake,
  HeartPulse,
  Activity,
  MessageCircle,
  PieChart,
  PiggyBank,
  ShoppingBasket,
  Users,
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
  "love-calculator": Heart,
  "relationship-depth": HeartHandshake,
  "business-partnership-calculator": BriefcaseBusiness,
  "pocket-money-calculator": PiggyBank,
  "dog-ownership-calculator": Dog,
  "parent-respect-calculator": Users,
  "stranger-sharing-calculator": MessageCircle,
  "mental-health-calculator": HeartPulse,
  "physical-health-calculator": Activity,
  "calorie-burn-calculator": Flame,
};

export function getToolIcon(slug: ToolSlug): LucideIcon {
  return TOOL_ICONS[slug];
}
