import { percentOf } from "../../lib/mockScoring";
import { dayKey, studyStreak } from "../../lib/studyStreak";
import { SUBJECT_LABELS, SUBJECT_ORDER, subjectOf } from "./analytics";
import type { SubjectKey } from "./types";

/** One finished test or module attempt, as the dashboard reads it. */
export interface InsightAttempt {
  id: string;
  kind: "practice" | "mock";
  /** The module or mock test name. */
  title: string;
  /** Which module or test it was, so repeat attempts group together. */
  groupId: string;
  /** Only practice modules have a subject; mock tests span subjects. */
  subject: SubjectKey | null;
  score: number;
  total: number;
  at: string | null;
}

export interface InsightLog {
  id: string;
  subject: string;
  minutes: number;
  questions: number;
  at: string | null;
}

export type ModuleStatus = "strong" | "moderate" | "weak";

export interface ModuleRow {
  id: string;
  title: string;
  kind: "practice" | "mock";
  subjectLabel: string;
  attempts: number;
  questions: number;
  accuracy: number;
  status: ModuleStatus;
}

export interface Insights {
  /** Mock test percentages, oldest first, last eight. */
  mockScores: { label: string; score: number }[];
  subjectStats: { name: string; accuracy: number; attempts: number }[];
  rings: { label: string; value: number }[];
  /** Questions attempted per day over the last seven days, oldest first. */
  daily: { label: string; count: number }[];
  log: { text: string; detail: string }[];
  overallAccuracy: number | null;
  mockCount: number;
  averageMock: number | null;
  studyMinutes: number;
  /** Study minutes logged this calendar month. */
  studyMinutesMonth: number;
  streak: number;
  modules: ModuleRow[];
}

export const STRONG_FROM = 75;
export const MODERATE_FROM = 60;

export function statusOf(accuracy: number): ModuleStatus {
  if (accuracy >= STRONG_FROM) return "strong";
  return accuracy >= MODERATE_FROM ? "moderate" : "weak";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const time = (value: string | null): number => {
  const parsed = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
};

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hr`;
}

/** All of the dashboard's numbers, worked out from the cadet's own attempts and study logs. */
export function buildInsights(attempts: readonly InsightAttempt[], logs: readonly InsightLog[], now: Date): Insights {
  const scored = attempts.filter((a) => a.total > 0);
  const mocks = scored.filter((a) => a.kind === "mock").sort((a, b) => time(a.at) - time(b.at));
  const mockScores = mocks.slice(-8).map((a, i, list) => ({
    label: `Mock ${mocks.length - list.length + i + 1}`,
    score: percentOf(a.score, a.total),
  }));

  const practice = scored.filter((a) => a.kind === "practice" && a.subject);
  const subjectStats = SUBJECT_ORDER.map((key) => {
    const rows = practice.filter((a) => a.subject === key);
    const questions = rows.reduce((sum, a) => sum + a.total, 0);
    return { name: SUBJECT_LABELS[key], attempts: rows.length, accuracy: percentOf(rows.reduce((s, a) => s + a.score, 0), questions) };
  }).filter((row) => row.attempts > 0);
  const rings = [...subjectStats]
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 3)
    .map((row) => ({ label: row.name, value: Math.round(row.accuracy) }));

  const perDay = new Map<string, number>();
  const addDay = (value: string | null, count: number) => {
    if (!value || count <= 0) return;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return;
    const key = dayKey(parsed);
    perDay.set(key, (perDay.get(key) ?? 0) + count);
  };
  for (const a of scored) addDay(a.at, a.total);
  for (const l of logs) addDay(l.at, l.questions);
  const daily = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
    return { label: WEEKDAYS[day.getDay()], count: perDay.get(dayKey(day)) ?? 0 };
  });

  const events = [
    ...attempts.map((a) => ({
      at: time(a.at),
      text: a.kind === "mock" ? `Mock test: ${a.title}` : `Practised ${a.title}`,
      detail: a.total > 0 ? (a.kind === "mock" ? `${percentOf(a.score, a.total)}%` : `${a.score}/${a.total}`) : "",
    })),
    ...logs.map((l) => ({ at: time(l.at), text: `Studied ${l.subject}`, detail: formatMinutes(l.minutes) })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 6);

  const groups = new Map<string, InsightAttempt[]>();
  for (const a of scored) groups.set(`${a.kind}:${a.groupId}`, [...(groups.get(`${a.kind}:${a.groupId}`) ?? []), a]);
  const modules: ModuleRow[] = [...groups.entries()].map(([id, rows]) => {
    const questions = rows.reduce((sum, a) => sum + a.total, 0);
    const accuracy = percentOf(rows.reduce((sum, a) => sum + a.score, 0), questions);
    const first = rows[0];
    return {
      id,
      title: first.title,
      kind: first.kind,
      subjectLabel: first.kind === "mock" ? "Mock test" : SUBJECT_LABELS[first.subject ?? "other"],
      attempts: rows.length,
      questions,
      accuracy,
      status: statusOf(accuracy),
    };
  });
  modules.sort((a, b) => a.accuracy - b.accuracy);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return {
    mockScores,
    subjectStats,
    rings,
    daily,
    log: events.map(({ text, detail }) => ({ text, detail })),
    overallAccuracy: scored.length ? percentOf(scored.reduce((s, a) => s + a.score, 0), scored.reduce((s, a) => s + a.total, 0)) : null,
    mockCount: mocks.length,
    averageMock: mocks.length ? Math.round((mocks.reduce((s, a) => s + percentOf(a.score, a.total), 0) / mocks.length) * 10) / 10 : null,
    studyMinutes: logs.reduce((s, l) => s + l.minutes, 0),
    studyMinutesMonth: logs.filter((l) => time(l.at) >= monthStart).reduce((s, l) => s + l.minutes, 0),
    streak: studyStreak([...attempts.map((a) => a.at), ...logs.map((l) => l.at)], now),
    modules,
  };
}

/** Maps a raw user_quiz_attempts row (with its joined module or mock test) to an InsightAttempt. */
export function toInsightAttempt(row: Record<string, unknown>): InsightAttempt | null {
  if (typeof row.id !== "string") return null;
  const one = (value: unknown) => (Array.isArray(value) ? value[0] : value) as Record<string, unknown> | null | undefined;
  const mock = row.attempt_kind === "mock";
  const quiz = one(row.quizzes);
  const test = one(row.mock_tests);
  const title = mock ? (typeof test?.title === "string" ? test.title : "Mock test") : typeof quiz?.title === "string" ? quiz.title : "Practice module";
  const category = typeof quiz?.category === "string" ? quiz.category : "General";
  return {
    id: row.id,
    kind: mock ? "mock" : "practice",
    title,
    groupId: String((mock ? row.mock_test_id : row.quiz_id) ?? row.id),
    subject: mock ? null : subjectOf({ title, category }),
    score: Number(row.score) || 0,
    total: Number(row.total_questions) || 0,
    at: typeof row.attempted_at === "string" ? row.attempted_at : null,
  };
}
