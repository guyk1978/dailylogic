import fs from "fs";

const esQuestions = JSON.parse(
  fs.readFileSync("scripts/data/parent-respect-es-questions.json", "utf8"),
);

const path = "locales/es/parentRespect.json";
const locale = JSON.parse(fs.readFileSync(path, "utf8"));
locale.questions = esQuestions;
fs.writeFileSync(path, JSON.stringify(locale, null, 2) + "\n");
console.log("es questions", Object.keys(esQuestions).length);
