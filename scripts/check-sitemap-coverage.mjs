#!/usr/bin/env node
/**
 * Verifies sitemap coverage sources: tool landings, interactive tools (via
 * content JSON toolSlug), and articles on disk for en/he/es.
 * Run: node scripts/check-sitemap-coverage.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const locales = ["en", "he", "es"];
const contentRoot = path.join(root, "content");

function listJsonSlugs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

function listMdxSlugs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .sort();
}

const landingSlugs = new Set();
const toolSlugs = new Set();
const articleSlugs = new Set();

for (const locale of locales) {
  for (const slug of listJsonSlugs(path.join(contentRoot, locale, "tools"))) {
    landingSlugs.add(slug);
    const file = path.join(contentRoot, locale, "tools", `${slug}.json`);
    try {
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      if (data.toolSlug) toolSlugs.add(data.toolSlug);
    } catch {
      /* ignore */
    }
  }
  for (const slug of listMdxSlugs(path.join(contentRoot, "articles", locale))) {
    articleSlugs.add(slug);
  }
}

const recentLandings = [
  "stranger-sharing-calculator",
  "mental-health-calculator",
  "physical-health-calculator",
  "calorie-burn-calculator",
  "parent-respect-calculator",
];
const recentArticles = [
  "stranger-sharing-calculator",
  "resilience-balance-calculator",
  "physical-health-calculator",
  "calorie-burn-calculator",
  "parental-respect-calculator",
  "allowance-calculator",
];

const missingLandings = recentLandings.filter((s) => !landingSlugs.has(s));
const missingArticles = recentArticles.filter((s) => !articleSlugs.has(s));

// Per-locale article presence for recent set
const localeGaps = [];
for (const slug of recentArticles) {
  for (const locale of locales) {
    const file = path.join(contentRoot, "articles", locale, `${slug}.mdx`);
    if (!fs.existsSync(file)) localeGaps.push(`${locale}/blog/${slug}`);
  }
}

console.log(
  JSON.stringify(
    {
      landingCount: landingSlugs.size,
      toolSlugCount: toolSlugs.size,
      articleCount: articleSlugs.size,
      expectedSitemapUrlsMin:
        locales.length *
        (3 /* home tools blog */ +
          landingSlugs.size +
          toolSlugs.size +
          articleSlugs.size),
      missingRecentLandings: missingLandings,
      missingRecentArticles: missingArticles,
      localeGaps,
      note: "src/app/sitemap.ts → buildSitemapEntries() auto-scans these folders and emits hreflang alternates.",
    },
    null,
    2,
  ),
);

if (missingLandings.length || missingArticles.length || localeGaps.length) {
  process.exitCode = 1;
}
