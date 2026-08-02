import type { AppLocale } from "@/lib/i18n/settings";
import type { ToolSlug } from "@/lib/tools-registry";

export type CrosswordDirection = "across" | "down";
export type CrosswordScript = "latin" | "hebrew";

export interface CrosswordClue {
  number: number;
  direction: CrosswordDirection;
  clue: string;
  answer: string;
  row: number;
  col: number;
}

export interface LocalizedCrossword {
  script: CrosswordScript;
  size: number;
  /** Row-major grid: letter or null for a block */
  grid: (string | null)[][];
  clues: CrosswordClue[];
  /** Two progressive hints revealed on demand */
  hints: [string, string];
}

export interface CrosswordDay {
  id: string;
  relatedTool: ToolSlug;
  /** i18n key under crossword.themes */
  themeKey: string;
  en: LocalizedCrossword;
  he: LocalizedCrossword;
}

export interface CrosswordPuzzle extends LocalizedCrossword {
  id: string;
  relatedTool: ToolSlug;
  themeKey: string;
  locale: AppLocale;
}

/** YYYY-MM-DD in local time — used for daily rotation + storage. */
export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 1-based day of year (1–366). */
export function getDayOfYear(date = new Date()): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((now - start) / 86_400_000);
}

export function getTodaysPuzzle(
  locale: AppLocale,
  date = new Date(),
): CrosswordPuzzle {
  const index = (getDayOfYear(date) - 1) % DAILY_CROSSWORDS.length;
  const day = DAILY_CROSSWORDS[index < 0 ? 0 : index]!;
  const localized = locale === "he" ? day.he : day.en;

  return {
    id: day.id,
    relatedTool: day.relatedTool,
    themeKey: day.themeKey,
    locale,
    ...localized,
  };
}

export function getClueNumberAt(
  puzzle: Pick<CrosswordPuzzle, "clues">,
  row: number,
  col: number,
): number | undefined {
  const clue = puzzle.clues.find((c) => c.row === row && c.col === col);
  return clue?.number;
}

export interface DailyCrosswordProgress {
  dateKey: string;
  puzzleId: string;
  locale: string;
  solved: boolean;
  /** Flat map of "r-c" → user letter */
  letters: Record<string, string>;
}

export const DAILY_CROSSWORD_STORAGE_KEY = "dailylogic:daily-crossword";

export function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

const HEBREW_FINAL_TO_REGULAR: Record<string, string> = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};

export function normalizeLetter(
  letter: string,
  script: CrosswordScript,
): string {
  if (!letter) return "";
  if (script === "latin") return letter.toUpperCase();
  return HEBREW_FINAL_TO_REGULAR[letter] ?? letter;
}

export function extractTypedLetter(
  raw: string,
  script: CrosswordScript,
): string {
  if (script === "latin") {
    return normalizeLetter(
      raw.replace(/[^a-zA-Z]/g, "").slice(-1),
      script,
    );
  }
  return normalizeLetter(
    raw.replace(/[^\u0590-\u05FF]/g, "").slice(-1),
    script,
  );
}

export function isPuzzleSolved(
  puzzle: Pick<CrosswordPuzzle, "size" | "grid" | "script">,
  letters: Record<string, string>,
): boolean {
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      const expected = puzzle.grid[r]![c];
      if (expected === null) continue;
      const got = normalizeLetter(letters[cellKey(r, c)] ?? "", puzzle.script);
      if (got !== normalizeLetter(expected, puzzle.script)) return false;
    }
  }
  return true;
}

export function getCellValidation(
  puzzle: Pick<CrosswordPuzzle, "grid" | "script">,
  row: number,
  col: number,
  letters: Record<string, string>,
): "empty" | "correct" | "incorrect" {
  const expected = puzzle.grid[row]![col];
  if (expected === null) return "empty";
  const got = letters[cellKey(row, col)];
  if (!got) return "empty";
  return normalizeLetter(got, puzzle.script) ===
    normalizeLetter(expected, puzzle.script)
    ? "correct"
    : "incorrect";
}

/**
 * Daily mini-crosswords — separate EN (Latin) and HE (Hebrew) grids
 * so letter counts and RTL reading order stay natural per locale.
 * Spanish UI falls back to the English puzzle content.
 */
export const DAILY_CROSSWORDS: CrosswordDay[] = [
  {
    id: "budget-spend",
    relatedTool: "budget-simple",
    themeKey: "budget",
    en: {
      script: "latin",
      size: 5,
      grid: [
        ["S", "A", "V", "E", null],
        ["P", null, null, null, null],
        ["E", "A", "R", "N", null],
        ["N", null, null, null, null],
        ["D", "E", "B", "T", null],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "Put money aside for later",
          answer: "SAVE",
          row: 0,
          col: 0,
        },
        {
          number: 3,
          direction: "across",
          clue: "Make money from work",
          answer: "EARN",
          row: 2,
          col: 0,
        },
        {
          number: 4,
          direction: "across",
          clue: "Money you owe",
          answer: "DEBT",
          row: 4,
          col: 0,
        },
        {
          number: 1,
          direction: "down",
          clue: "Use money to buy things",
          answer: "SPEND",
          row: 0,
          col: 0,
        },
      ],
      hints: [
        "1-Down is the opposite of putting money aside.",
        "The long vertical word is SPEND.",
      ],
    },
    he: {
      script: "hebrew",
      size: 5,
      grid: [
        ["ח", "ס", "כ", "ו", "ן"],
        ["ש", null, null, null, null],
        ["ב", null, null, null, null],
        ["ו", null, null, null, null],
        ["ן", "כ", "ס", "ף", null],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "שמירת כסף לעתיד",
          answer: "חסכון",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          direction: "across",
          clue: "מטבע או מזומן",
          answer: "כסף",
          row: 4,
          col: 1,
        },
        {
          number: 1,
          direction: "down",
          clue: "דף הוצאות או חשבון לתשלום",
          answer: "חשבון",
          row: 0,
          col: 0,
        },
      ],
      hints: [
        "1 אופקי ו-1 אנכי מתחילים באות ח.",
        "המילה האנכית הארוכה היא חשבון.",
      ],
    },
  },
  {
    id: "kitchen-flour",
    relatedTool: "recipe-adjuster",
    themeKey: "kitchen",
    en: {
      script: "latin",
      size: 5,
      grid: [
        ["F", "L", "O", "U", "R"],
        ["R", null, null, null, null],
        ["Y", null, "P", "A", "N"],
        [null, null, null, null, null],
        ["S", "A", "L", "T", null],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "Baking staple for bread and cakes",
          answer: "FLOUR",
          row: 0,
          col: 0,
        },
        {
          number: 3,
          direction: "across",
          clue: "Flat cookware for frying",
          answer: "PAN",
          row: 2,
          col: 2,
        },
        {
          number: 4,
          direction: "across",
          clue: "Seasoning that makes soup sing",
          answer: "SALT",
          row: 4,
          col: 0,
        },
        {
          number: 1,
          direction: "down",
          clue: "Cook in hot oil",
          answer: "FRY",
          row: 0,
          col: 0,
        },
      ],
      hints: [
        "1-Across is white powder used in baking.",
        "1-Down is FRY — it shares F with FLOUR.",
      ],
    },
    he: {
      script: "hebrew",
      size: 5,
      grid: [
        ["מ", "ר", "ק", null, "ת"],
        ["ל", null, null, null, "נ"],
        ["ח", null, null, null, "ו"],
        [null, null, null, null, "ר"],
        ["ס", "י", "ר", null, null],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "מנה חמה בקערה",
          answer: "מרק",
          row: 0,
          col: 0,
        },
        {
          number: 3,
          direction: "across",
          clue: "כלי בישול עמוק",
          answer: "סיר",
          row: 4,
          col: 0,
        },
        {
          number: 1,
          direction: "down",
          clue: "תבלין לבן נפוץ",
          answer: "מלח",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          direction: "down",
          clue: "מכשיר לאפייה בחום",
          answer: "תנור",
          row: 0,
          col: 4,
        },
      ],
      hints: [
        "1 אופקי ו-1 אנכי מתחילים במ״ם.",
        "2 אנכי הוא תנור — לבישול ואפייה.",
      ],
    },
  },
  {
    id: "tip-split",
    relatedTool: "tip-split",
    themeKey: "tip",
    en: {
      script: "latin",
      size: 5,
      grid: [
        ["T", "I", "P", null, "S"],
        ["I", null, "A", null, "P"],
        ["P", "A", "Y", null, "L"],
        [null, null, null, null, "I"],
        [null, null, null, null, "T"],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "Gratuity for good service",
          answer: "TIP",
          row: 0,
          col: 0,
        },
        {
          number: 3,
          direction: "across",
          clue: "Settle the check",
          answer: "PAY",
          row: 2,
          col: 0,
        },
        {
          number: 1,
          direction: "down",
          clue: "Gratuity for good service",
          answer: "TIP",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          direction: "down",
          clue: "Settle the check",
          answer: "PAY",
          row: 0,
          col: 2,
        },
        {
          number: 4,
          direction: "down",
          clue: "Divide a bill among friends",
          answer: "SPLIT",
          row: 0,
          col: 4,
        },
      ],
      hints: [
        "1-Across and 1-Down are the same three-letter word.",
        "4-Down (far right) is SPLIT.",
      ],
    },
    he: {
      script: "hebrew",
      size: 5,
      grid: [
        ["ט", "י", "פ", null, null],
        ["י", null, null, null, null],
        ["פ", null, null, null, null],
        [null, null, null, null, null],
        ["ש", "ל", "ם", null, null],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "תשר על שירות טוב",
          answer: "טיפ",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          direction: "across",
          clue: "לשלם את החשבון",
          answer: "שלם",
          row: 4,
          col: 0,
        },
        {
          number: 1,
          direction: "down",
          clue: "תשר על שירות טוב",
          answer: "טיפ",
          row: 0,
          col: 0,
        },
      ],
      hints: [
        "1 אופקי ו-1 אנכי הם אותה מילה בת שלוש אותיות.",
        "2 אופקי בשורה התחתונה הוא שלם.",
      ],
    },
  },
  {
    id: "shop-deals",
    relatedTool: "unit-compare",
    themeKey: "shopping",
    en: {
      script: "latin",
      size: 5,
      grid: [
        ["D", "E", "A", "L", "S"],
        ["E", null, null, null, null],
        ["A", null, null, null, null],
        ["L", "O", "W", null, null],
        ["S", null, null, null, null],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "Bargains worth grabbing",
          answer: "DEALS",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          direction: "across",
          clue: "Unit price you want to find",
          answer: "LOW",
          row: 3,
          col: 0,
        },
        {
          number: 1,
          direction: "down",
          clue: "Bargains worth grabbing",
          answer: "DEALS",
          row: 0,
          col: 0,
        },
      ],
      hints: [
        "1-Across and 1-Down share the same five-letter word.",
        "That shared word is DEALS.",
      ],
    },
    he: {
      script: "hebrew",
      size: 5,
      grid: [
        ["מ", "ב", "צ", "ע", null],
        ["ח", null, null, null, null],
        ["י", null, null, null, null],
        ["ר", null, null, null, null],
        [null, "ז", "ו", "ל", null],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "הנחה זמנית בחנות",
          answer: "מבצע",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          direction: "across",
          clue: "לא יקר",
          answer: "זול",
          row: 4,
          col: 1,
        },
        {
          number: 1,
          direction: "down",
          clue: "כמה עולה מוצר",
          answer: "מחיר",
          row: 0,
          col: 0,
        },
      ],
      hints: [
        "1 אופקי ו-1 אנכי מתחילים במ״ם.",
        "1 אנכי הוא מחיר.",
      ],
    },
  },
  {
    id: "time-task",
    relatedTool: "time-value",
    themeKey: "delegate",
    en: {
      script: "latin",
      size: 5,
      grid: [
        ["T", "I", "M", "E", null],
        ["A", null, null, null, null],
        ["S", null, null, null, null],
        ["K", null, null, null, null],
        ["H", "I", "R", "E", null],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "Hours and minutes",
          answer: "TIME",
          row: 0,
          col: 0,
        },
        {
          number: 2,
          direction: "across",
          clue: "Pay a pro to do the job",
          answer: "HIRE",
          row: 4,
          col: 0,
        },
        {
          number: 1,
          direction: "down",
          clue: "A job to get done",
          answer: "TASK",
          row: 0,
          col: 0,
        },
      ],
      hints: [
        "1-Down starts with the same letter as 1-Across.",
        "1-Down is TASK; 2-Across is HIRE.",
      ],
    },
    he: {
      script: "hebrew",
      size: 5,
      grid: [
        ["ז", "מ", "ן", null, "כ"],
        [null, null, null, null, "ס"],
        [null, null, null, null, "ף"],
        [null, null, null, null, null],
        ["ל", "ב", "ד", null, null],
      ],
      clues: [
        {
          number: 1,
          direction: "across",
          clue: "שעות ודקות",
          answer: "זמן",
          row: 0,
          col: 0,
        },
        {
          number: 3,
          direction: "across",
          clue: "בלי עזרה מבחוץ",
          answer: "לבד",
          row: 4,
          col: 0,
        },
        {
          number: 2,
          direction: "down",
          clue: "מטבע לתשלום לבעל מקצוע",
          answer: "כסף",
          row: 0,
          col: 4,
        },
      ],
      hints: [
        "1 אופקי קשור לשעון.",
        "2 אנכי הוא כסף; 3 אופקי הוא לבד.",
      ],
    },
  },
];
