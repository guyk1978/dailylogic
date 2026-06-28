import type { ComponentType } from "react";
import type { ToolCategory } from "@/lib/tools-registry";

/** Monoline SVG illustrations — stroke weight matches Lucide (1.5) */
const STROKE = 1.5;

interface IllustrationProps {
  className?: string;
}

function FinanceIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        x="12"
        y="20"
        width="40"
        height="28"
        rx="4"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path
        d="M12 28h40"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <circle cx="44" cy="38" r="4" stroke="currentColor" strokeWidth={STROKE} />
      <path
        d="M22 44h8M22 48h5"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path
        d="M46 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path
        d="M42 12v-2M46 12v-2M44 8v2"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

function KitchenIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M20 46V26c0-4.4 3.6-8 8-8h8c4.4 0 8 3.6 8 8v20"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 46h32"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path
        d="M28 18V12M36 18V12"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <ellipse
        cx="32"
        cy="34"
        rx="6"
        ry="4"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <path
        d="M44 14c2 0 4 2 4 4"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShoppingIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M18 22h28l-3 24H21L18 22z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M24 22V18a8 8 0 0 1 16 0v4"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26" cy="50" r="2" fill="currentColor" />
      <circle cx="38" cy="50" r="2" fill="currentColor" />
      <path
        d="M42 14l4-4 4 4"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 10v8"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

const ILLUSTRATIONS: Record<ToolCategory, ComponentType<IllustrationProps>> = {
  finance: FinanceIllustration,
  kitchen: KitchenIllustration,
  shopping: ShoppingIllustration,
};

const CATEGORY_ACCENT: Record<ToolCategory, string> = {
  finance: "text-blue-500 bg-blue-50",
  kitchen: "text-amber-600 bg-amber-50",
  shopping: "text-emerald-600 bg-emerald-50",
};

export function CategoryIllustration({
  category,
}: {
  category: ToolCategory;
}) {
  const Illustration = ILLUSTRATIONS[category];
  const accent = CATEGORY_ACCENT[category];

  return (
    <div
      className={`hidden shrink-0 items-center justify-center rounded-2xl p-3 sm:flex sm:h-16 sm:w-16 ${accent}`}
    >
      <Illustration className="h-10 w-10" />
    </div>
  );
}

export function getCategoryAccent(category: ToolCategory): string {
  return CATEGORY_ACCENT[category].split(" ")[0] ?? "text-blue-500";
}

export function getCategoryIconBg(category: ToolCategory): string {
  return CATEGORY_ACCENT[category].split(" ")[1] ?? "bg-blue-50";
}
