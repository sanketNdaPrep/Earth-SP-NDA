import { supabase } from "@/lib/supabaseClient";
import type { TestKind } from "@/lib/test-settings";

export * from "@/lib/test-settings";

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
  /** Full mock test, subject-wise test or chapter-wise test. */
  kind: TestKind;
  subject_id: string | null;
  chapter_id: string | null;
  marks_per_correct: number;
  negative_marks: number;
  cutoff_min: number | null;
  cutoff_max: number | null;
  /** Path of the PDF the admin uploaded, for the student download. */
  source_pdf: string | null;
}

export const MOCK_COLUMNS =
  "id, title, code, target_exam, total_questions, duration_minutes, total_marks, passing_marks, is_published, created_at, kind, subject_id, chapter_id, marks_per_correct, negative_marks, cutoff_min, cutoff_max, source_pdf";

/** A question attached to a mock test. */
export interface AttachedQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
}

/** The next free test code for an exam, for example NDA-MOCK-03. */
export async function nextMockCode(exam: Exam, kind: TestKind = "mock"): Promise<string> {
  const { count } = await supabase.from("mock_tests").select("id", { count: "exact", head: true }).eq("target_exam", exam).eq("kind", kind);
  const word = kind === "mock" ? "MOCK" : kind === "subject" ? "SUBJ" : "CHAP";
  return `${exam}-${word}-${String((count ?? 0) + 1).padStart(2, "0")}`;
}

/** True when a request failed only because migration 006 (test_questions) has not been run yet. */
export function isMissingLinkTable(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /test_questions/i.test(error.message ?? "");
}
