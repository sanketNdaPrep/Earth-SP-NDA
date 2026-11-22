/** Pure scoring helpers for server-scored mock tests. No I/O, so they are easy to test. */

export const LETTERS = ["A", "B", "C", "D"] as const;
export type Letter = (typeof LETTERS)[number];

export function isLetter(value: unknown): value is Letter {
  return typeof value === "string" && (LETTERS as readonly string[]).includes(value);
}

/** One question of the answer key. `correct` is null when the stored key is not A to D. */
export interface KeyEntry {
  id: string;
  correct: Letter | null;
}

/** What the attempt remembers about one question. Saved with the attempt for the result page. */
export interface AnswerItem {
  question_id: string;
  chosen: Letter | null;
  correct: Letter;
}

export interface ScoreSummary {
  /** Questions that can be scored (they have a valid answer key). */
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  items: AnswerItem[];
}

/**
 * Compares the cadet's answers with the key, in the key's order.
 * `answers` is untrusted input: unknown ids, bad letters and extra entries are ignored.
 */
export function scoreSubmission(key: readonly KeyEntry[], answers: unknown): ScoreSummary {
  const given: Record<string, unknown> = typeof answers === "object" && answers !== null ? (answers as Record<string, unknown>) : {};
  const items: AnswerItem[] = [];
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  for (const entry of key) {
    if (entry.correct === null) continue; // never scored, never counted
    const raw = Object.prototype.hasOwnProperty.call(given, entry.id) ? given[entry.id] : undefined;
    const chosen = isLetter(raw) ? raw : null;
    items.push({ question_id: entry.id, chosen, correct: entry.correct });
    if (chosen === null) unanswered += 1;
    else if (chosen === entry.correct) correct += 1;
    else wrong += 1;
  }
  return { total: items.length, correct, wrong, unanswered, items };
}

/** Percentage with one decimal. 0 when there are no questions. */
export function percentOf(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}

/** Marks earned: every question is worth the same share of the total marks. No negative marking. */
export function marksFor(correct: number, total: number, totalMarks: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * totalMarks * 100) / 100;
}

/**
 * Marks with negative marking: right answers earn `perCorrect`, wrong answers lose `negative`,
 * unanswered questions count for nothing. Can be below zero.
 */
export function marksWithNegative(correct: number, wrong: number, perCorrect: number, negative: number): number {
  return Math.round((correct * perCorrect - wrong * negative + Number.EPSILON) * 100) / 100;
}

/** Of the questions answered, the share that were right, as a percentage. null when nothing was answered. */
export function accuracyOf(correct: number, wrong: number): number | null {
  const attempted = correct + wrong;
  return attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : null;
}

/** Time taken, never negative and never more than the time allowed. */
export function clampSeconds(elapsedMs: number, limitSeconds: number): number {
  const secs = Math.round(elapsedMs / 1000);
  return Math.max(0, Math.min(secs, limitSeconds));
}
