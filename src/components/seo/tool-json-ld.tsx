import type { ToolLandingJson } from "@/lib/content/types";

interface ToolJsonLdProps {
  landing: ToolLandingJson;
  pageUrl: string;
}

export function ToolJsonLd({ landing, pageUrl }: ToolJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": landing.schemaType ?? "WebApplication",
    name: landing.seoTitle ?? landing.title,
    description: landing.seoDescription ?? landing.subtitle,
    url: pageUrl,
    applicationCategory: landing.applicationCategory ?? "Calculator",
    operatingSystem: "Web browser",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
