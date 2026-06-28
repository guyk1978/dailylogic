#!/usr/bin/env node
/**
 * Generates locale JSON files from public/locales/en/common.json
 * using Google Cloud Translation API (v2).
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json npm run translate
 *   — or —
 *   GOOGLE_TRANSLATE_API_KEY=your-key npm run translate
 *
 * Options:
 *   --dry-run   Print sample translations without writing files
 *   --locale=he Target a single locale (default: all non-en locales from next-i18next.config.js)
 */

import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const config = require(path.join(root, "next-i18next.config.js"));

const masterPath = path.join(root, "public/locales/en/common.json");
const dryRun = process.argv.includes("--dry-run");
const localeArg = process.argv.find((arg) => arg.startsWith("--locale="));
const singleLocale = localeArg?.split("=")[1];

const targetLocales = singleLocale
  ? [singleLocale]
  : config.i18n.locales.filter((locale) => locale !== config.i18n.defaultLocale);

async function loadMaster() {
  const raw = await fs.readFile(masterPath, "utf8");
  return JSON.parse(raw);
}

function collectStrings(node, prefix = "", out = []) {
  if (typeof node === "string") {
    out.push({ key: prefix, text: node });
    return out;
  }

  if (Array.isArray(node)) {
    node.forEach((item, index) => collectStrings(item, `${prefix}[${index}]`, out));
    return out;
  }

  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      const next = prefix ? `${prefix}.${key}` : key;
      collectStrings(value, next, out);
    }
  }

  return out;
}

function setDeep(obj, keyPath, value) {
  const parts = keyPath.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in cursor)) cursor[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
}

function protectPlaceholders(text) {
  return text.replace(/\{\{(\w+)\}\}/g, "__PH_$1__");
}

function restorePlaceholders(text) {
  return text.replace(/__PH_(\w+)__/g, "{{$1}}");
}

async function createTranslator() {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (apiKey) {
    return new Translate({ key: apiKey });
  }
  return new Translate();
}

async function translateBatch(translator, texts, target) {
  if (texts.length === 0) return [];
  const protectedTexts = texts.map(protectPlaceholders);
  const [translations] = await translator.translate(protectedTexts, target);
  const list = Array.isArray(translations) ? translations : [translations];
  return list.map(restorePlaceholders);
}

async function translateTree(translator, master, target) {
  const entries = collectStrings(master);
  const batchSize = 50;
  const result = structuredClone(master);

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const translated = await translateBatch(
      translator,
      batch.map((entry) => entry.text),
      target,
    );

    batch.forEach((entry, index) => {
      setDeep(result, entry.key, translated[index]);
    });
  }

  return result;
}

async function main() {
  const master = await loadMaster();
  const translator = await createTranslator();

  console.log(`Master: ${masterPath}`);
  console.log(`Targets: ${targetLocales.join(", ")}`);

  for (const locale of targetLocales) {
    console.log(`Translating → ${locale}…`);
    const translated = await translateTree(translator, master, locale);

    if (dryRun) {
      console.log(JSON.stringify(translated, null, 2).slice(0, 500), "…");
      continue;
    }

    const outDir = path.join(root, "public/locales", locale);
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, "common.json");
    await fs.writeFile(outPath, `${JSON.stringify(translated, null, 2)}\n`, "utf8");
    console.log(`Wrote ${outPath}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
