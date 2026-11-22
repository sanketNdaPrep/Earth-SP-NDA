// Pure rules for tests: types, marks, cutoff and the save check. No imports, so they run in tests and on the server.

export const TEST_KINDS = ["mock", "subject", "chapter"] as const;
export type TestKind = (typeof TEST_KINDS)[number];

export const KIND_LABEL: Record<TestKind, string> = {
  mock: "Full mock test",
  subject: "Subject-wise test",
  chapter: "Chapter-wise test",
};

/** The short word for a tab or a badge. */
export const KIND_SHORT: Record<TestKind, string> = { mock: "Full mock", subject: "Subject-wise", chapter: "Chapter-wise" };

export function isTestKind(value: unknown): value is TestKind {
  return typeof value === "string" && (TEST_KINDS as readonly string[]).includes(value);
}

/** No cap on the number of questions. This only stops a mistyped number from filling a form. */
export const MOCK_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  durationMax: 1000,
  marksMax: 100,
  questionsMax: 5000,
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Total marks of a test: every question is worth the same. */
export function totalMarksOf(questionCount: number, perCorrect: number): number {
  return round2(questionCount * perCorrect);
}

/** How a score sits against the expected cutoff range. null when the admin set none. */
export type CutoffStanding = "below" | "within" | "above";
export function cutoffStanding(marks: number, min: number | null, max: number | null): CutoffStanding | null {
  if (min === null && max === null) return null;
  if (min !== null && marks < min) return "below";
  if (max !== null && marks > max) return "above";
  return "within";
}

/** "280 to 320", "280 and above", "up to 320", or null. */
export function cutoffText(min: number | null, max: number | null): string | null {
  const fmt = (n: number) => String(round2(n));
  if (min !== null && max !== null) return min === max ? fmt(min) : `${fmt(min)} to ${fmt(max)}`;
  if (min !== null) return `${fmt(min)} and above`;
  if (max !== null) return `up to ${fmt(max)}`;
  return null;
}

export interface MockTestDraft {
  title: string;
  kind: TestKind;
  hasSubject: boolean;
  hasChapter: boolean;
  duration: string;
  marksPerCorrect: string;
  negativeMarks: string;
  cutoffMin: string;
  cutoffMax: string;
  published: boolean;
  questionCount: number;
}

/** Empty text means "not set". Anything else must be a number. */
export function parseOptionalNumber(text: string): number | null | "bad" {
  const t = text.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : "bad";
}

/** First problem that blocks saving, or null when the test can be saved. */
export function checkMockTest(draft: MockTestDraft): string | null {
  const title = draft.title.trim();
  if (title.length < MOCK_LIMITS.titleMin) return `Give the test a title of at least ${MOCK_LIMITS.titleMin} characters.`;
  if (title.length > MOCK_LIMITS.titleMax) return `Keep the title under ${MOCK_LIMITS.titleMax} characters.`;

  if (draft.kind !== "mock" && !draft.hasSubject) return "Pick the subject this test belongs to.";
  if (draft.kind === "chapter" && !draft.hasChapter) return "Pick or type the chapter this test belongs to.";

  const duration = Number(draft.duration);
  if (!Number.isInteger(duration) || duration < 1 || duration > MOCK_LIMITS.durationMax) {
    return `Time must be a whole number of minutes between 1 and ${MOCK_LIMITS.durationMax}.`;
  }

  const perCorrect = Number(draft.marksPerCorrect);
  if (!Number.isFinite(perCorrect) || perCorrect <= 0 || perCorrect > MOCK_LIMITS.marksMax) {
    return `Marks for a right answer must be more than 0 and at most ${MOCK_LIMITS.marksMax}.`;
  }
  const negative = Number(draft.negativeMarks || "0");
  if (!Number.isFinite(negative) || negative < 0 || negative > MOCK_LIMITS.marksMax) {
    return `Marks taken off for a wrong answer must be 0 or more (write 0 for no negative marking).`;
  }

  const min = parseOptionalNumber(draft.cutoffMin);
  const max = parseOptionalNumber(draft.cutoffMax);
  if (min === "bad" || max === "bad") return "The cutoff must be a number, or left empty.";
  if (min !== null && min < 0) return "The cutoff cannot be below 0.";
  if (min !== null && max !== null && max < min) return "The highest cutoff must be the same as or more than the lowest.";
  const total = totalMarksOf(draft.questionCount, perCorrect);
  if (draft.questionCount > 0 && ((max !== null && max > total) || (min !== null && min > total))) {
    return `The cutoff cannot be more than the total marks (${total}).`;
  }

  if (draft.published && draft.questionCount === 0) return "Add at least one question before publishing, or save it as a draft.";
  return null;
}

