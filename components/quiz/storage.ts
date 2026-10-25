import { OPTION_LETTERS, type AnswerMap, type FlagMap } from './types';

/**
 * Auto-save buffer. The whole attempt lives in one localStorage key per cadet and
 * module, so a refresh, a crash or a closed tab drops the cadet back where they were.
 * The deadline is stored as a wall-clock time, so the clock keeps running while the page is closed.
 */
const VERSION = 1;

export interface SavedSession {
  v: typeof VERSION;
  quizId: string;
  questionIds: string[];
  startedAt: number;
  /** null for an untimed module. */
  endsAt: number | null;
  current: number;
  answers: AnswerMap;
  marked: FlagMap;
  visited: FlagMap;
}

export function sessionKey(userKey: string, quizId: string): string {
  return `earth-sp-nda:quiz-session:${userKey}:${quizId}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function parseSession(raw: string): SavedSession | null {
  const value: unknown = JSON.parse(raw);
  if (!isObject(value) || value.v !== VERSION) return null;
  if (typeof value.quizId !== 'string') return null;
  if (!Array.isArray(value.questionIds) || !value.questionIds.every((id) => typeof id === 'string')) return null;
  if (!isFinitePositive(value.startedAt)) return null;
  if (value.endsAt !== null && !isFinitePositive(value.endsAt)) return null;
  if (typeof value.current !== 'number' || !Number.isInteger(value.current)) return null;
  if (!isObject(value.answers) || !isObject(value.marked) || !isObject(value.visited)) return null;

  const letters: readonly unknown[] = OPTION_LETTERS;
  const answers: AnswerMap = {};
  for (const [id, letter] of Object.entries(value.answers)) {
    if (letters.includes(letter)) answers[id] = letter as AnswerMap[string];
  }
  const flags = (source: Record<string, unknown>): FlagMap => {
    const out: FlagMap = {};
    for (const [id, flag] of Object.entries(source)) if (flag === true) out[id] = true;
    return out;
  };

  return {
    v: VERSION,
    quizId: value.quizId,
    questionIds: value.questionIds as string[],
    startedAt: value.startedAt,
    endsAt: value.endsAt as number | null,
    current: value.current,
    answers,
    marked: flags(value.marked),
    visited: flags(value.visited),
  };
}

export function loadSession(key: string): SavedSession | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? parseSession(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(key: string, session: SavedSession): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearSession(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clear if storage is blocked.
  }
}

/** False in private windows or when site data is blocked. Checked once, so the player can say so. */
export function isStorageWritable(): boolean {
  try {
    const probe = 'earth-sp-nda:probe';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}