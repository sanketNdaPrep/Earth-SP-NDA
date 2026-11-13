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
