/** The exams a subject or a file can be tagged for. */
export const EXAMS = [
  { id: "nda", name: "NDA" },
  { id: "cds", name: "CDS" },
  { id: "afcat", name: "AFCAT" },
] as const;
export type ExamId = (typeof EXAMS)[number]["id"];

/** Keeps only known exam ids, in the NDA, CDS, AFCAT order, without repeats. */
export function cleanExams(value: unknown): ExamId[] {
  const list = Array.isArray(value) ? value : [];
  return EXAMS.map((e) => e.id).filter((id) => list.includes(id));
}

export const SUBJECT_COVER_BUCKET = "subject-covers";

export interface Subject {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  description: string;
  icon_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  /** "exam" rows are the entry schemes on the homepage; "subject" rows are study subjects. */
  kind: "exam" | "subject";
  cover_path: string | null;
  exams: ExamId[];
}

/** Icons an admin can pick for a subject. Every name exists in components/ui/icons.tsx. */
export const SUBJECT_ICONS = [
  "shield",
  "target",
  "calculator",
  "plane",
  "book",
  "atom",
  "flask",
  "globe",
  "landmark",
  "sigma",
  "users",
  "triangle",
] as const;

/** Lowercase letters, digits and single dashes, for the URL part. */
export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Only these three have a full exam page. Any other subject opens the practice tests list. */
const EXAM_PAGE_SLUGS = new Set(["nda", "cds", "afcat"]);

export function subjectHref(slug: string) {
  return EXAM_PAGE_SLUGS.has(slug) ? `/exams/${slug}` : "/quizzes";
}

/** A unique path inside the cover bucket. The extension comes from the file type, never from the name. */
export function coverPath(file: { name: string; type: string }, id: string): string {
  const ext: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
  const base = file.name
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `covers/${id}-${base || "cover"}.${ext[file.type] ?? "jpg"}`;
}
