import { percentOf } from "./mockScoring";

export const EXAMS = ["NDA", "CDS", "AFCAT"] as const;

/** One enrolled student, as the admin pages show them. */
export interface RosterStudent {
  id: string;
  name: string;
  email: string;
  targetExam: string;
  joinedAt: string | null;
  testsTaken: number;
  /** Correct answers over all questions attempted, as a percentage. Null before the first test. */
  accuracy: number | null;
  lastAttempt: string | null;
}

export interface ExamSummary {
  exam: string;
  enrolled: number;
  testsTaken: number;
  accuracy: number | null;
}

const num = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const text = (value: unknown): string => (typeof value === "string" ? value : "");

/** Reads one row of admin_student_roster(). */
export function toRosterStudent(row: Record<string, unknown>): RosterStudent | null {
  const id = text(row.id);
  if (!id) return null;
  const email = text(row.email);
  const questions = num(row.questions);
  return {
    id,
    name: text(row.full_name).trim() || email.split("@")[0] || "Unnamed cadet",
    email,
    targetExam: text(row.target_exam) || "NDA",
    joinedAt: text(row.created_at) || null,
    testsTaken: num(row.tests_taken),
    accuracy: questions > 0 ? percentOf(num(row.correct), questions) : null,
    lastAttempt: text(row.last_attempt) || null,
  };
}

/** Reads admin_exam_summary(). NDA, CDS and AFCAT always appear, with zeros when nobody has enrolled. */
export function toExamSummaries(rows: readonly Record<string, unknown>[]): ExamSummary[] {
  const byExam = new Map<string, ExamSummary>();
  for (const row of rows) {
    const exam = text(row.target_exam);
    if (!exam) continue;
    const questions = num(row.questions);
    byExam.set(exam, {
      exam,
      enrolled: num(row.enrolled),
      testsTaken: num(row.tests_taken),
      accuracy: questions > 0 ? percentOf(num(row.correct), questions) : null,
    });
  }
  const known = EXAMS.map((exam) => byExam.get(exam) ?? { exam, enrolled: 0, testsTaken: 0, accuracy: null });
  const others = [...byExam.values()].filter((item) => !(EXAMS as readonly string[]).includes(item.exam));
  return [...known, ...others];
}

/** Search by name or email, and optionally narrow to one target exam. */
export function filterStudents(students: readonly RosterStudent[], query: string, exam: string | null): RosterStudent[] {
  const needle = query.trim().toLowerCase();
  return students.filter(
    (student) =>
      (exam === null || student.targetExam === exam) &&
      (needle === "" || student.name.toLowerCase().includes(needle) || student.email.toLowerCase().includes(needle)),
  );
}

export function formatDay(value: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
