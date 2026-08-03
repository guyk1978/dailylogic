import fs from "fs";

const path = "locales/he/parentRespect.json";
const j = JSON.parse(fs.readFileSync(path, "utf8"));

const fix = (obj) => {
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === "string") {
      obj[k] = v
        .replace(/מרathon, לא sprint/g, "מרathon, לא sprint")
        .replace(/מרathon/g, "מרathon")
        .replace(/מרathon/g, "מרathon")
        .replace(/\u05de\u05e8athon/g, "\u05de\u05e8\u05ea\u05d5\u05df")
        .replace(/, לא sprint/g, ", לא sprint")
        .replace(/לא sprint/g, "לא sprint")
        .replace(/לא sprint/g, "\u05dc\u05d0 \u05e1\u05e4\u05e8\u05d9\u05e0\u05d8")
        .replace(/על הקרban/g, "\u05e2\u05dc \u05d4\u05e7\u05e8\u05d1\u05e0\u05d5\u05ea")
        .replace(/בייבי-סיטr/g, "\u05d1\u05d9\u05d9\u05d1\u05d9-\u05e1\u05d9\u05d8\u05e8")
        .replace(/נשמע רשmi/g, "\u05e0\u05e9\u05de\u05e2 \u05e8\u05e9\u05de\u05d9")
        .replace(/בלי פanic/g, "\u05d1\u05dc\u05d9 \u05e4\u05d7\u05d3")
        .replace(/"נראה" vague/g, '"\u05e0\u05e8\u05d0\u05d4" \u05de\u05e2\u05d5\u05e8\u05e4\u05dc')
        .replace(/בלי follow-through/g, "\u05d1\u05dc\u05d9 \u05d4\u05de\u05e9\u05da")
        .replace(/לא enforcement/g, "\u05dc\u05dc\u05d0 \u05db\u05e4\u05d9\u05d9\u05d4")
        .replace(/נagging עד/g, "\u05e8\u05e6\u05e3 \u05d4\u05e2\u05e8\u05d5\u05ea \u05e2\u05d3")
        .replace(/לא דרamטi/g, "\u05dc\u05d0 \u05d3\u05e8\u05de\u05d8\u05d9")
        .replace(/לא דרamטי/g, "\u05dc\u05d0 \u05d3\u05e8\u05de\u05d8\u05d9")
        .replace(/קורban/g, "\u05e7\u05d5\u05e8\u05d1\u05df")
        .replace(/מניפולציה passive-aggressive/g, "\u05de\u05e0\u05d9\u05e4\u05d5\u05dc\u05e6\u05d9\u05d4 \u05e4\u05e1\u05d9\u05d1\u05d9\u05ea-\u05d0\u05d2\u05e8\u05e1\u05d9\u05d1\u05d9\u05ea")
        .replace(/מקבל\/ת ואז מ انتקים ביקורת/g, "\u05de\u05e7\u05d1\u05dc\/\u05ea \u05d5\u05d0\u05d6 \u05de\u05d1\u05e7\u05d9\u05e8 \u05d1\u05d9\u05e7\u05d5\u05e8\u05ea");
    } else if (v && typeof v === "object") fix(v);
  }
};

fix(j);
fs.writeFileSync(path, JSON.stringify(j, null, 2) + "\n");
console.log("he cleanup done");
