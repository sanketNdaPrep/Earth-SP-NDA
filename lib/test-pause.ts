import { isLetter, type Letter } from "./mockScoring";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IDS = 5000;

/** A paused test is kept this long, then it counts as abandoned and the next start is fresh. */
export const PAUSE_KEEP_MS = 7 * 24 * 60 * 60 * 1000;

/** Where the cadet was: sent to the server when pausing and handed back when continuing. */
export interface TestProgress {
  answers: Record<string, Letter>;
  marked: string[];
  visited: string[];
  current: number;
}

const ids = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter((v): v is string => typeof v === "string" && UUID.test(v)))].slice(0, MAX_IDS) : [];

/** Keeps only well-formed progress. Anything else is dropped, so the browser cannot store junk. */
export function cleanProgress(input: unknown): TestProgress {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const answers: Record<string, Letter> = {};
  if (typeof raw.answers === "object" && raw.answers !== null) {
    for (const [id, letter] of Object.entries(raw.answers as Record<string, unknown>).slice(0, MAX_IDS)) {
      if (UUID.test(id) && isLetter(letter)) answers[id] = letter;
    }
  }
  const current = typeof raw.current === "number" && Number.isInteger(raw.current) && raw.current >= 0 && raw.current < MAX_IDS ? raw.current : 0;
  return { answers, marked: ids(raw.marked), visited: ids(raw.visited), current };
}

/** Seconds left in a running test, never below zero. */
export function secondsLeft(startedMs: number, limitMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((startedMs + limitMs - nowMs) / 1000));
}

/** The start time that makes a test with `remainingSeconds` left run on from `nowMs`. */
export function startedAtOnResume(nowMs: number, limitMs: number, remainingSeconds: number): number {
  return nowMs - (limitMs - remainingSeconds * 1000);
}

/** True when a pause is too old to continue. */
export function pauseExpired(pausedMs: number, nowMs: number): boolean {
  return Number.isNaN(pausedMs) || nowMs - pausedMs > PAUSE_KEEP_MS;
}
