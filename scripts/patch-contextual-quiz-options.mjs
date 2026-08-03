/**
 * Merge contextual quiz options into locale JSON files.
 * Run: node scripts/patch-contextual-quiz-options.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "scripts", "data");

const jobs = [
  {
    optionsFile: "quiz-options-dog.json",
    localeFile: "dogOwnership.json",
  },
  {
    optionsFile: "quiz-options-biz.json",
    localeFile: "businessPartnership.json",
  },
  {
    optionsFile: "quiz-options-rel.json",
    localeFile: "relationshipDepth.json",
  },
];

for (const job of jobs) {
  const optionsPath = path.join(dataDir, job.optionsFile);
  if (!fs.existsSync(optionsPath)) {
    console.error("Missing", optionsPath);
    process.exit(1);
  }
  const byLocale = JSON.parse(fs.readFileSync(optionsPath, "utf8"));

  for (const locale of ["he", "en", "es"]) {
    const file = path.join(root, "locales", locale, job.localeFile);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const opts = byLocale[locale];
    if (!opts) {
      console.error("No options for", locale, job.optionsFile);
      process.exit(1);
    }

    let patched = 0;
    let missing = [];
    for (const [id, options] of Object.entries(opts)) {
      if (!data.questions?.[id]) {
        missing.push(id);
        continue;
      }
      data.questions[id].options = options;
      patched += 1;
    }

    const questionIds = Object.keys(data.questions || {});
    const without = questionIds.filter((id) => !data.questions[id].options);
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(
      `${locale}/${job.localeFile}: patched ${patched}, missingQ ${missing.length}, stillWithout ${without.length}`,
      without.length ? without : "",
    );
  }
}
