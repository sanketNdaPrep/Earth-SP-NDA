import type { AnswerItem, Letter } from "@/lib/mockScoring";
import type { TestKind } from "@/lib/test-settings";

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
  kind: TestKind;
  marksPerCorrect: number;
  negativeMarks: number;
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

/** One earlier attempt at the same test, for the "your attempts" list. */
export interface AttemptSummary {
  attemptId: string;
  attemptedAt: string | null;
  marks: number;
  totalMarks: number;
  correct: number;
  total: number;
}

export interface ResultData {
  attemptId: string;
  mockTestId: string | null;
  kind: TestKind;
  title: string;
  exam: string;
  /** Subject and chapter names, for subject-wise and chapter-wise tests. */
  subjectName: string | null;
  chapterName: string | null;
  marksPerCorrect: number;
  negativeMarks: number;
  cutoffMin: number | null;
  cutoffMax: number | null;
  /** Right answers as a share of the questions answered. null when none were answered. */
  accuracy: number | null;
  attempted: number;
  /** The same test, newest first, this attempt included. */
  history: AttemptSummary[];
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
  kind?: TestKind;
  subject_name?: string | null;
  chapter_name?: string | null;
  marks_per_correct?: number;
  negative_marks?: number;
  /** Marks after negative marking. Older attempts do not have it. */
  marks?: number;
  cutoff_min?: number | null;
  cutoff_max?: number | null;
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
