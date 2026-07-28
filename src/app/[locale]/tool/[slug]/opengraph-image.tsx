import { ImageResponse } from "next/og";
import { localeResources } from "@/lib/i18n/resources";
import { isAppLocale, type AppLocale } from "@/lib/i18n/settings";
import {
  OG_SIZE,
  TOOL_OG_ACCENT,
  TOOL_OG_EMOJI,
} from "@/lib/seo/tool-og";
import { getToolBySlug, type ToolSlug } from "@/lib/tools-registry";

export const runtime = "edge";
export const alt = "DailyLogic tool";
export const size = OG_SIZE;
export const contentType = "image/png";

async function loadFont(text: string, locale: AppLocale): Promise<ArrayBuffer | null> {
  try {
    const family =
      locale === "he"
        ? "Noto+Sans+Hebrew:wght@700"
        : "Noto+Sans:wght@700";
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
    const css = await fetch(cssUrl, {
      headers: {
        // Request a direct font file URL.
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    }).then((res) => res.text());

    const match = css.match(/src: url\(([^)]+)\)/);
    if (!match?.[1]) return null;
    return await fetch(match[1]).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function ToolOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale: AppLocale = isAppLocale(rawLocale) ? rawLocale : "en";
  const tool = getToolBySlug(slug);
  const common = localeResources[locale].common;
  const brand = common.app.name;
  const tagline = common.app.tagline;

  const name =
    common.tools[slug as ToolSlug]?.name ?? tool?.meta.name ?? slug;
  const description =
    common.tools[slug as ToolSlug]?.description ??
    tool?.meta.description ??
    "";
  const categoryKey = (tool?.meta.category ?? "finance") as keyof typeof TOOL_OG_ACCENT;
  const accent = TOOL_OG_ACCENT[categoryKey];
  const emoji = TOOL_OG_EMOJI[(slug as ToolSlug) in TOOL_OG_EMOJI ? (slug as ToolSlug) : "budget-simple"];
  const dir = locale === "he" ? "rtl" : "ltr";

  const fontText = `${brand}${name}${description}${tagline}`;
  const fontData = await loadFont(fontText, locale);

  const fontFamily = fontData ? "ToolOg" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: `linear-gradient(135deg, ${accent.from} 0%, #ffffff 48%, ${accent.to} 100%)`,
          direction: dir,
          fontFamily,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: accent.chip,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            DL
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>
              {brand}
            </div>
            <div style={{ fontSize: 20, color: "#64748b" }}>{tagline}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 24,
              background: "#fff",
              border: `2px solid ${accent.soft}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
            }}
          >
            {emoji}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.1,
              maxWidth: 980,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#475569",
              lineHeight: 1.35,
              maxWidth: 920,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 999,
              background: "#fff",
              color: accent.chip,
              fontSize: 22,
              fontWeight: 700,
              border: `1px solid ${accent.soft}`,
            }}
          >
            dailylogic.app
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: fontData
        ? [
            {
              name: "ToolOg",
              data: fontData,
              style: "normal" as const,
              weight: 700 as const,
            },
          ]
        : [],
    },
  );
}
