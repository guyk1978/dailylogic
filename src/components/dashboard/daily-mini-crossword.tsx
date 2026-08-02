"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightbulb, Puzzle, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/provider";
import {
  useAppLocale,
  useLocaleDirection,
} from "@/hooks/use-locale-direction";
import { useLocalizedPath } from "@/hooks/use-localized-path";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTranslatedTool } from "@/hooks/use-translated-tools";
import {
  getCategoryAccent,
  getCategoryIconBg,
} from "@/components/dashboard/category-illustrations";
import { ICON_STROKE_WIDTH, getToolIcon } from "@/lib/tool-icons";
import { easeOut, springPop } from "@/lib/motion-presets";
import {
  cellKey,
  DAILY_CROSSWORD_STORAGE_KEY,
  extractTypedLetter,
  getCellValidation,
  getClueNumberAt,
  getLocalDateKey,
  getTodaysPuzzle,
  isPuzzleSolved,
  type CrosswordClue,
  type CrosswordPuzzle,
  type DailyCrosswordProgress,
} from "@/lib/daily-crossword";

const EMPTY_PROGRESS: DailyCrosswordProgress = {
  dateKey: "",
  puzzleId: "",
  locale: "",
  solved: false,
  letters: {},
};

function findNextOpenCell(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  dRow: number,
  dCol: number,
): { row: number; col: number } | null {
  let r = row + dRow;
  let c = col + dCol;
  while (r >= 0 && r < puzzle.size && c >= 0 && c < puzzle.size) {
    if (puzzle.grid[r]![c] !== null) return { row: r, col: c };
    r += dRow;
    c += dCol;
  }
  return null;
}

function cellToneClass(
  validation: "empty" | "correct" | "incorrect",
  isActive: boolean,
): string {
  if (validation === "correct") {
    return isActive
      ? "border-emerald-500 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300/60"
      : "border-emerald-400 bg-emerald-50 text-emerald-900";
  }
  if (validation === "incorrect") {
    return isActive
      ? "border-rose-500 bg-rose-100 text-rose-900 ring-2 ring-rose-300/60"
      : "border-rose-400 bg-rose-50 text-rose-900";
  }
  return isActive
    ? "border-sky-400 bg-sky-50 text-slate-900 ring-2 ring-sky-300/50"
    : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-300/50";
}

export function DailyMiniCrossword() {
  const { t } = useTranslation("common");
  const lp = useLocalizedPath();
  const dir = useLocaleDirection();
  const locale = useAppLocale();
  const titleId = useId();
  const isRtlPuzzle = locale === "he";

  const puzzle = useMemo(() => getTodaysPuzzle(locale), [locale]);
  const dateKey = useMemo(() => getLocalDateKey(), []);
  const relatedTool = useTranslatedTool(puzzle.relatedTool);
  const ToolIcon = getToolIcon(puzzle.relatedTool);

  const [progress, setProgress, isHydrated] = useLocalStorage<DailyCrosswordProgress>(
    DAILY_CROSSWORD_STORAGE_KEY,
    EMPTY_PROGRESS,
  );

  const [letters, setLetters] = useState<Record<string, string>>({});
  const [solved, setSolved] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(
    null,
  );
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const syncedKeyRef = useRef("");

  // Sync from storage once hydrated; reset when day or locale changes.
  useEffect(() => {
    if (!isHydrated) return;

    const key = `${dateKey}:${puzzle.id}:${locale}`;
    const storedKey = `${progress.dateKey}:${progress.puzzleId}:${progress.locale}`;

    if (storedKey !== key) {
      syncedKeyRef.current = "";
      setReady(false);
      setLetters({});
      setSolved(false);
      setProgress({
        dateKey,
        puzzleId: puzzle.id,
        locale,
        solved: false,
        letters: {},
      });
      return;
    }

    if (syncedKeyRef.current === key) return;

    syncedKeyRef.current = key;
    setLetters(progress.letters);
    setSolved(progress.solved);
    setReady(true);
  }, [
    isHydrated,
    progress.dateKey,
    progress.puzzleId,
    progress.locale,
    progress.letters,
    progress.solved,
    dateKey,
    puzzle.id,
    locale,
    setProgress,
  ]);

  const persist = useCallback(
    (nextLetters: Record<string, string>, nextSolved: boolean) => {
      setProgress({
        dateKey,
        puzzleId: puzzle.id,
        locale,
        solved: nextSolved,
        letters: nextLetters,
      });
    },
    [dateKey, puzzle.id, locale, setProgress],
  );

  const focusCell = useCallback((row: number, col: number) => {
    const key = cellKey(row, col);
    const el = inputRefs.current[key];
    el?.focus();
    el?.select();
    setActiveCell({ row, col });
  }, []);

  const advanceAfterType = useCallback(
    (row: number, col: number) => {
      // Data order: across advances +col; in RTL the grid mirrors visually.
      const next =
        findNextOpenCell(puzzle, row, col, 0, 1) ??
        findNextOpenCell(puzzle, row, col, 1, 0);
      if (next) requestAnimationFrame(() => focusCell(next.row, next.col));
    },
    [focusCell, puzzle],
  );

  const applyLetter = useCallback(
    (row: number, col: number, raw: string) => {
      const letter = extractTypedLetter(raw, puzzle.script);
      const key = cellKey(row, col);

      setLetters((prev) => {
        const next = { ...prev };
        if (letter) next[key] = letter;
        else delete next[key];

        const complete = isPuzzleSolved(puzzle, next);
        setSolved(complete);
        persist(next, complete);
        return next;
      });

      if (letter) advanceAfterType(row, col);
    },
    [advanceAfterType, persist, puzzle],
  );

  const handleChange = (row: number, col: number, e: ChangeEvent<HTMLInputElement>) => {
    applyLetter(row, col, e.target.value);
  };

  const handleKeyDown = (
    row: number,
    col: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    const key = cellKey(row, col);
    if (e.key === "Backspace") {
      e.preventDefault();
      if (letters[key]) {
        applyLetter(row, col, "");
      } else {
        // Prefer previous across cell (data -1 col); mirrors visual "back" in RTL too.
        const prev =
          findNextOpenCell(puzzle, row, col, 0, -1) ??
          findNextOpenCell(puzzle, row, col, -1, 0);
        if (prev) {
          applyLetter(prev.row, prev.col, "");
          focusCell(prev.row, prev.col);
        }
      }
      return;
    }

    // Arrow keys follow visual direction.
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const dCol = isRtlPuzzle ? -1 : 1;
      const next = findNextOpenCell(puzzle, row, col, 0, dCol);
      if (next) focusCell(next.row, next.col);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const dCol = isRtlPuzzle ? 1 : -1;
      const next = findNextOpenCell(puzzle, row, col, 0, dCol);
      if (next) focusCell(next.row, next.col);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = findNextOpenCell(puzzle, row, col, 1, 0);
      if (next) focusCell(next.row, next.col);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = findNextOpenCell(puzzle, row, col, -1, 0);
      if (next) focusCell(next.row, next.col);
    }
  };

  const acrossClues = puzzle.clues.filter((c) => c.direction === "across");
  const downClues = puzzle.clues.filter((c) => c.direction === "down");
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const category = relatedTool?.category ?? "finance";
  const iconColor = getCategoryAccent(category);
  const iconBg = getCategoryIconBg(category);

  const highlightClue = (clue: CrosswordClue) => {
    focusCell(clue.row, clue.col);
  };

  if (!isHydrated || !ready) {
    return (
      <section
        className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-50/60 via-white to-emerald-50/40 p-5 shadow-sm ring-1 ring-slate-200/60 sm:p-7"
        aria-hidden
      >
        <div className="h-52 animate-pulse rounded-2xl bg-slate-100/80" />
      </section>
    );
  }

  return (
    <motion.section
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.03, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-50/70 via-white to-emerald-50/40 p-5 shadow-sm ring-1 ring-slate-200/60 sm:p-7"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(14,165,233,0.12), transparent 32%), radial-gradient(circle at 90% 15%, rgba(59,130,246,0.10), transparent 28%), radial-gradient(circle at 60% 90%, rgba(16,185,129,0.10), transparent 30%)",
        }}
        aria-hidden
      />

      <div className="relative mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-sm ring-1 ring-white/80">
            <Puzzle className="h-5 w-5" strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
          </div>
          <div>
            <p className="label-caption text-sky-600">{t("crossword.badge")}</p>
            <h2
              id={titleId}
              className="mt-1 text-2xl font-semibold tracking-tight text-slate-900"
            >
              {t("crossword.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("crossword.description", {
                theme: t(`crossword.themes.${puzzle.themeKey}`),
              })}
            </p>
          </div>
        </div>
        <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200/70">
          {t("crossword.underMinute")}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {solved ? (
          <motion.div
            key="solved"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={easeOut}
            className="relative"
          >
            <div className="result-success !border-emerald-200 !py-7">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springPop}
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
              >
                <Sparkles className="h-6 w-6" strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
              </motion.div>
              <p className="text-lg font-semibold text-emerald-900">
                {t("crossword.successTitle")}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-emerald-800/80">
                {t("crossword.successDescription")}
              </p>

              {relatedTool && (
                <Link
                  href={lp(`/tool/${relatedTool.slug}`)}
                  prefetch
                  className="btn-primary mt-6 inline-flex gap-2 !bg-emerald-600 hover:!bg-emerald-700"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}
                  >
                    <ToolIcon
                      className={`h-3.5 w-3.5 ${iconColor}`}
                      strokeWidth={ICON_STROKE_WIDTH}
                      aria-hidden
                    />
                  </span>
                  {t("crossword.cta", { tool: relatedTool.name })}
                  <Arrow className="h-4 w-4" strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`play-${locale}-${puzzle.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start"
          >
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div
                dir={isRtlPuzzle ? "rtl" : "ltr"}
                lang={isRtlPuzzle ? "he" : "en"}
                role="grid"
                aria-label={t("crossword.gridLabel")}
                className="inline-grid gap-1.5 rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-200/80"
                style={{
                  gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
                }}
              >
                {puzzle.grid.map((rowCells, row) =>
                  rowCells.map((cell, col) => {
                    if (cell === null) {
                      return (
                        <div
                          key={cellKey(row, col)}
                          className="rounded-xl bg-slate-100/90 ring-1 ring-inset ring-slate-200/70"
                          style={{ width: "3.25rem", height: "3.25rem" }}
                          aria-hidden
                        />
                      );
                    }

                    const number = getClueNumberAt(puzzle, row, col);
                    const key = cellKey(row, col);
                    const isActive =
                      activeCell?.row === row && activeCell?.col === col;
                    const value = letters[key] ?? "";
                    const validation = getCellValidation(puzzle, row, col, letters);

                    return (
                      <div key={key} className="relative" role="gridcell">
                        {number !== undefined && (
                          <span className="pointer-events-none absolute start-1 top-0.5 z-10 text-[10px] font-bold leading-none text-slate-400">
                            {number}
                          </span>
                        )}
                        <input
                          ref={(el) => {
                            inputRefs.current[key] = el;
                          }}
                          type="text"
                          inputMode="text"
                          autoComplete="off"
                          autoCapitalize={
                            puzzle.script === "latin" ? "characters" : "none"
                          }
                          spellCheck={false}
                          maxLength={2}
                          value={value}
                          aria-label={t("crossword.cellLabel", {
                            row: row + 1,
                            col: col + 1,
                          })}
                          aria-invalid={validation === "incorrect"}
                          onFocus={() => setActiveCell({ row, col })}
                          onChange={(e) => handleChange(row, col, e)}
                          onKeyDown={(e) => handleKeyDown(row, col, e)}
                          className={`rounded-xl border text-center text-xl font-bold outline-none transition sm:text-2xl ${
                            puzzle.script === "latin" ? "uppercase" : ""
                          } ${cellToneClass(validation, isActive)}`}
                          style={{ width: "3.25rem", height: "3.25rem" }}
                        />
                      </div>
                    );
                  }),
                )}
              </div>

              <p className="text-xs text-slate-400">{t("crossword.liveHint")}</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ClueList
                  title={t("crossword.across")}
                  clues={acrossClues}
                  onSelect={highlightClue}
                />
                <ClueList
                  title={t("crossword.down")}
                  clues={downClues}
                  onSelect={highlightClue}
                />
              </div>
              <PuzzleHints hints={puzzle.hints} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function PuzzleHints({ hints }: { hints: [string, string] }) {
  const { t } = useTranslation("common");
  const [revealed, setRevealed] = useState<[boolean, boolean]>([false, false]);

  const toggle = (index: 0 | 1) => {
    setRevealed((prev) => {
      const next: [boolean, boolean] = [...prev];
      next[index] = !prev[index];
      return next;
    });
  };

  return (
    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/70 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb
          className="h-4 w-4 text-amber-500"
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
        <h3 className="label-caption text-slate-500">{t("crossword.hintsTitle")}</h3>
      </div>
      <ul className="space-y-2.5">
        {hints.map((hint, index) => {
          const i = index as 0 | 1;
          const open = revealed[i];
          return (
            <li key={i}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggle(i)}
                className="btn-secondary w-full justify-between gap-3 !px-3.5 !py-2.5 text-start text-sm"
              >
                <span>
                  {open
                    ? t("crossword.hideHint", { number: i + 1 })
                    : t("crossword.showHint", { number: i + 1 })}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    open ? "text-amber-600" : "text-slate-400"
                  }`}
                >
                  {open ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.p
                    key={`hint-${i}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <span className="mt-2 block rounded-xl bg-amber-50/90 px-3.5 py-2.5 text-sm leading-relaxed text-amber-950 ring-1 ring-amber-100/80">
                      {hint}
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ClueList({
  title,
  clues,
  onSelect,
}: {
  title: string;
  clues: CrosswordClue[];
  onSelect: (clue: CrosswordClue) => void;
}) {
  const unique = clues.filter(
    (clue, index, arr) =>
      arr.findIndex(
        (c) => c.number === clue.number && c.direction === clue.direction,
      ) === index,
  );

  return (
    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/70 sm:p-5">
      <h3 className="label-caption mb-3 text-slate-500">{title}</h3>
      <ul className="space-y-2.5">
        {unique.map((clue) => (
          <li key={`${clue.direction}-${clue.number}`}>
            <button
              type="button"
              onClick={() => onSelect(clue)}
              className="flex w-full gap-2.5 rounded-xl px-2.5 py-2 text-start text-sm leading-snug text-slate-700 transition hover:bg-sky-50/80"
            >
              <span className="w-6 shrink-0 font-bold text-sky-600">
                {clue.number}.
              </span>
              <span>{clue.clue}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
