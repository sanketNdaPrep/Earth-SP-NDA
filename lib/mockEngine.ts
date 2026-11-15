import type { AnswerItem, Letter } from "@/lib/mockScoring";

/** A question as the test taker sees it. The answer key and the solution are never in here. */
export interface PublicQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface PublicTest {
  id: string;
  title: string;
  exam: string;
  durationMinutes: number;
  totalMarks: number;
}

export type EngineFailure =
  | "auth" // not signed in
  | "missing" // no such test, or not published
  | "empty" // the test has no questions
  | "config" // the server is missing its service key
  | "nosession" // submit without a started test
  | "late" // submitted long after the time ran out
  | "error";

export type StartResult =
  | {
      ok: true;
      test: PublicTest;
      questions: PublicQuestion[];
      /** Seconds left, worked out by the server. */
      remainingSeconds: number;
      /** Identifies this sitting, so saved answers match the right attempt. */
      sittingId: string;
      resumed: boolean;
    }
  | { ok: false; reason: EngineFailure; message: string };

export type SubmitResult = { ok: true; attemptId: string } | { ok: false; reason: EngineFailure; message: string };

/** One question of the finished attempt, with the answer and solution (only sent after submitting). */
export interface ResultItem {
  question: {
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    explanation: string | null;
  } | null;
  chosen: Letter | null;
  correct: Letter;
}

export interface ResultData {
  attemptId: string;
  mockTestId: string | null;
  title: string;
  exam: string;
  attemptedAt: string | null;
  timeTakenSeconds: number;
  score: number;
  total: number;
  wrong: number;
  unanswered: number;
  percentage: number;
  marks: number;
  totalMarks: number;
  passingMarks: number;
  items: ResultItem[];
}

export type ResultFetch = { ok: true; result: ResultData } | { ok: false; reason: EngineFailure | "notfound"; message: string };

/** What the attempt row keeps in `details`. */
export interface AttemptDetails {
  title: string;
  exam: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  wrong: number;
  unanswered: number;
  items: AnswerItem[];
}

/** One question's answer key, handed to a signed-in cadet only after they finish a practice module. */
export interface PracticeKeyRow {
  id: string;
  correct: Letter | null;
  explanation: string | null;
}

export type PracticeKeyResult =
  | { ok: true; key: PracticeKeyRow[] }
  | { ok: false; reason: "auth" | "missing" | "config" | "error"; message: string };
