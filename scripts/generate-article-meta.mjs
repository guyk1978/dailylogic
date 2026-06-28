#!/usr/bin/env node
/**
 * Generates static article metadata for edge-compatible pages.
 * Run automatically before `next build` via the prebuild script.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const locales = ["en", "he", "es"];
const outPath = path.join(root, "src/lib/content/article-meta.generated.json");

const articleMetaByLocale = {};

for (const locale of locales) {
  const dir = path.join(root, "content", "articles", locale);
  if (!fs.existsSync(dir)) {
    articleMetaByLocale[locale] = [];
    continue;
  }

  articleMetaByLocale[locale] = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const source = fs.readFileSync(path.join(dir, file), "utf8");
      const { data } = matter(source);
      return {
        slug,
        title: data.title,
        description: data.description,
        publishedAt: data.publishedAt,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? 0).getTime() -
        new Date(a.publishedAt ?? 0).getTime(),
    );
}

fs.writeFileSync(outPath, `${JSON.stringify(articleMetaByLocale, null, 2)}\n`);
console.log(`Wrote article metadata for ${locales.length} locales to ${path.relative(root, outPath)}`);
