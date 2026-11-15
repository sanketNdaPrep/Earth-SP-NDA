import { supabase } from "@/lib/supabaseClient";

export const EXAMS = ["NDA", "CDS", "AFCAT"] as const;
export type Exam = (typeof EXAMS)[number];

/** A mock test as the admin pages and the student quizzes page load it. */
export interface MockTestRow {
  id: string;
  title: string;
  code: string;
  target_exam: Exam;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  is_published: boolean;
  created_at: string;
}

export const MOCK_COLUMNS =
  "id, title, code, target_exam, total_questions, duration_minutes, total_marks, passing_marks, is_published, created_at";

export const MOCK_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  durationMax: 600,
  marksMax: 1000,
  questionsMax: 200,
};

/** A question attached to a mock test. */
export interface AttachedQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
}

export interface MockTestDraft {
  title: string;
  duration: string;
  totalMarks: string;
  passingMarks: string;
  published: boolean;
  questionCount: number;
}

/** First problem that blocks saving, or null when the test can be saved. */
export function checkMockTest(draft: MockTestDraft): string | null {
  const title = draft.title.trim();
  if (title.length < MOCK_LIMITS.titleMin) return `Give the test a title of at least ${MOCK_LIMITS.titleMin} characters.`;
  if (title.length > MOCK_LIMITS.titleMax) return `Keep the title under ${MOCK_LIMITS.titleMax} characters.`;

  const duration = Number(draft.duration);
  if (!Number.isInteger(duration) || duration < 1 || duration > MOCK_LIMITS.durationMax) {
    return `Duration must be a whole number of minutes between 1 and ${MOCK_LIMITS.durationMax}.`;
  }

  const marks = Number(draft.totalMarks);
  if (!Number.isInteger(marks) || marks < 1 || marks > MOCK_LIMITS.marksMax) {
    return `Total marks must be a whole number between 1 and ${MOCK_LIMITS.marksMax}.`;
  }

  const passing = Number(draft.passingMarks || "0");
  if (!Number.isInteger(passing) || passing < 0 || passing > marks) {
    return "Passing marks must be a whole number from 0 up to the total marks.";
  }

  if (draft.published && draft.questionCount === 0) return "Add at least one question before publishing, or save it as a draft.";
  return null;
}

/** The next free test code for an exam, for example NDA-MOCK-03. */
export async function nextMockCode(exam: Exam): Promise<string> {
  const { count } = await supabase.from("mock_tests").select("id", { count: "exact", head: true }).eq("target_exam", exam);
  return `${exam}-MOCK-${String((count ?? 0) + 1).padStart(2, "0")}`;
}

/** True when a request failed only because migration 006 (test_questions) has not been run yet. */
export function isMissingLinkTable(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /test_questions/i.test(error.message ?? "");
}
