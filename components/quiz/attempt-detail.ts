import { OPTION_LETTERS, type AnswerMap, type FlagMap } from './types';

/**
 * The database keeps only the score and question count of an attempt. This is the rest of it:
 * which option was picked, what was flagged and how long each question took.
 * It is saved in this browser when a test is submitted, and the results page reads it back,
 * so the full review is available on the device the test was taken on.
 */
const VERSION = 1;
const KEEP = 10;

export interface AttemptDetail {
  v: typeof VERSION;
  quizId: string;
  /** Wall-clock time of the submit. Used to pair this snapshot with its database row. */
  submittedAt: number;
  /** Correct answers at the time, which must equal the logged `score` to be paired. */
  correct: number;
  total: number;
  questionIds: string[];
  answers: AnswerMap;
  marked: FlagMap;
  /** Milliseconds spent on each question, keyed by question id. */
  spentMs: Record<string, number>;
  timeTakenSecs: number;
  /** null for an untimed module. */
  limitSecs: number | null;
}

const key = (userKey: string, quizId: string) => `earth-sp-nda:attempt-details:${userKey}:${quizId}`;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function parseDetail(value: unknown): AttemptDetail | null {
  if (!isObject(value) || value.v !== VERSION) return null;
  if (typeof value.quizId !== 'string') return null;
  if (typeof value.submittedAt !== 'number' || !Number.isFinite(value.submittedAt)) return null;
  if (typeof value.correct !== 'number' || typeof value.total !== 'number') return null;
  if (!Array.isArray(value.questionIds) || !value.questionIds.every((id) => typeof id === 'string')) return null;
  if (!isObject(value.answers) || !isObject(value.marked) || !isObject(value.spentMs)) return null;
  if (typeof value.timeTakenSecs !== 'number') return null;
  if (value.limitSecs !== null && typeof value.limitSecs !== 'number') return null;

  const letters: readonly unknown[] = OPTION_LETTERS;
  const answers: AnswerMap = {};
  for (const [id, letter] of Object.entries(value.answers)) {
    if (letters.includes(letter)) answers[id] = letter as AnswerMap[string];
  }
  const marked: FlagMap = {};
  for (const [id, flag] of Object.entries(value.marked)) if (flag === true) marked[id] = true;
  const spentMs: Record<string, number> = {};
  for (const [id, ms] of Object.entries(value.spentMs)) {
    if (typeof ms === 'number' && Number.isFinite(ms) && ms >= 0) spentMs[id] = ms;
  }

  return {
    v: VERSION,
    quizId: value.quizId,
    submittedAt: value.submittedAt,
    correct: value.correct,
    total: value.total,
    questionIds: value.questionIds as string[],
    answers,
    marked,
    spentMs,
    timeTakenSecs: value.timeTakenSecs,
    limitSecs: value.limitSecs as number | null,
  };
}

export function loadAttemptDetails(userKey: string, quizId: string): AttemptDetail[] {
  try {
    const raw = window.localStorage.getItem(key(userKey, quizId));
    const list: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.map(parseDetail).filter((item): item is AttemptDetail => item !== null);
  } catch {
    return [];
  }
}

/** Newest first, ten per module. Fails quietly when the browser blocks storage. */
export function saveAttemptDetail(userKey: string, detail: AttemptDetail): void {
  try {
    const next = [detail, ...loadAttemptDetails(userKey, detail.quizId)].slice(0, KEEP);
    window.localStorage.setItem(key(userKey, detail.quizId), JSON.stringify(next));
  } catch {
    // Nothing else to do: the score is still logged to the database.
  }
}

/**
 * Finds the snapshot that belongs to a database row: same score and question count,
 * submitted closest to the time the row was written.
 */
export function pairAttemptDetail(
  details: readonly AttemptDetail[],
  attempt: { score: number; total_questions: number; attemptedAt: number | null },
): AttemptDetail | null {
  const matches = details.filter((item) => item.correct === attempt.score && item.total === attempt.total_questions);
  if (matches.length === 0) return null;
  if (attempt.attemptedAt === null) return matches[0];
  const at = attempt.attemptedAt;
  return matches.reduce((best, item) => (Math.abs(item.submittedAt - at) < Math.abs(best.submittedAt - at) ? item : best));
}