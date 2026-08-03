import fs from "fs";
import path from "path";

const roots = ["locales/he", "content/he/tools"];
const engRe = /\b([A-Za-z][A-Za-z0-9'/-]{0,})\b/g;
const allowExact = new Set([
  "URL",
  "API",
  "OK",
  "ID",
  "OG",
  "PWA",
  "JSON",
  "SEO",
  "FAQ",
  "CTA",
  "UI",
  "UX",
  "PDF",
  "PNG",
  "App",
  "app",
  "iOS",
  "Android",
  "WhatsApp",
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube",
  "LinkedIn",
  "Gmail",
  "Excel",
  "AI",
  "GPS",
  "WiFi",
  "USB",
  "HTML",
  "CSS",
  "JS",
  "TV",
  "PC",
  "Mac",
  "Google",
  "Apple",
  "Microsoft",
  "Zoom",
  "Teams",
  "SMS",
  "CSV",
  "KPI",
  "ROI",
  "CEO",
  "CTO",
  "CFO",
  "IT",
  "USD",
  "ILS",
  "EUR",
  "vs",
  "DailyLogic",
  "dailylogic",
]);
const allowPrefix = ["http", "www", "mailto"];

const findings = [];

function walk(obj, file, trail = "") {
  if (typeof obj === "string") {
    const words = [...obj.matchAll(engRe)]
      .map((m) => m[1])
      .filter((w) => {
        if (allowExact.has(w)) return false;
        if (allowPrefix.some((p) => w.toLowerCase().startsWith(p))) return false;
        if (/^\d+$/.test(w)) return false;
        return true;
      });
    if (words.length) {
      findings.push({ file, trail, words: [...new Set(words)], text: obj });
    }
    if (/מפרק\/?ה|מפרק /.test(obj)) {
      findings.push({
        file,
        trail,
        words: ["מפרק"],
        text: obj,
        note: "מפרק",
      });
    }
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      walk(v, file, trail ? `${trail}.${k}` : k);
    }
  }
}

for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const name of fs.readdirSync(root)) {
    if (!name.endsWith(".json")) continue;
    const file = path.join(root, name);
    walk(JSON.parse(fs.readFileSync(file, "utf8")), file);
  }
}

const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

for (const [file, items] of byFile) {
  console.log(`\n=== ${file} (${items.length}) ===`);
  for (const it of items) {
    console.log(`- ${it.trail}`);
    console.log(`  words: ${it.words.join(", ")}`);
    console.log(`  text: ${JSON.stringify(it.text).slice(0, 220)}`);
  }
}
console.log(`\nTOTAL ${findings.length}`);
