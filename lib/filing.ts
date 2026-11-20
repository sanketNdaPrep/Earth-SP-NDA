import { slugify } from "./subjects";
import { CHAPTER_NAME, type Chapter, type TaxSubject } from "./taxonomy";

/** The value of the subject box when the admin chooses to type a new subject. */
export const NEW_SUBJECT = "__new__";

export const SUBJECT_NAME = { min: 2, max: 60 } as const;

/** Finds an item by its name, ignoring capitals and extra spaces. */
export function findByName<T extends { name: string }>(list: readonly T[], name: string): T | undefined {
  const key = name.replace(/\s+/g, " ").trim().toLowerCase();
  return key ? list.find((x) => x.name.replace(/\s+/g, " ").trim().toLowerCase() === key) : undefined;
}

/** A slug that is not in `taken`: "biology", then "biology-2", "biology-3" and so on. */
export function uniqueSlug(name: string, taken: ReadonlySet<string>): string | null {
  const base = slugify(name);
  if (!base) return null;
  if (!taken.has(base)) return base;
  for (let n = 2; n < 100; n += 1) {
    const candidate = `${base.slice(0, 55)}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return null;
}

/** What the admin typed or picked for subject and chapter, before anything is saved. */
export interface FilingInput {
  /** An existing subject's id, NEW_SUBJECT, or "" when nothing is chosen. */
  subjectChoice: string;
  newSubjectName: string;
  chapterName: string;
}

export type FilingCheck =
  | { ok: true; subjectName: string; existingSubject: TaxSubject | null; chapterName: string; existingChapter: Chapter | null }
  | { ok: false; error: string };

/**
 * Checks what was typed and says whether the subject and chapter already exist.
 * A new subject or chapter whose name matches an existing one (ignoring capitals) reuses it, so nothing is duplicated.
 */
export function checkFiling(input: FilingInput, subjects: readonly TaxSubject[], chapters: readonly Chapter[]): FilingCheck {
  let existingSubject: TaxSubject | null = null;
  let subjectName: string;

  if (input.subjectChoice === NEW_SUBJECT) {
    subjectName = input.newSubjectName.replace(/\s+/g, " ").trim();
    if (subjectName.length < SUBJECT_NAME.min || subjectName.length > SUBJECT_NAME.max) {
      return { ok: false, error: `Type the new subject name, ${SUBJECT_NAME.min} to ${SUBJECT_NAME.max} characters.` };
    }
    if (!slugify(subjectName)) return { ok: false, error: "Use letters or numbers in the subject name." };
    existingSubject = findByName(subjects, subjectName) ?? null;
  } else {
    existingSubject = subjects.find((s) => s.id === input.subjectChoice) ?? null;
    if (!existingSubject) return { ok: false, error: "Pick a subject, or choose Other and type one." };
    subjectName = existingSubject.name;
  }

  const chapterName = input.chapterName.replace(/\s+/g, " ").trim();
  if (chapterName && (chapterName.length < CHAPTER_NAME.min || chapterName.length > CHAPTER_NAME.max)) {
    return { ok: false, error: `A chapter name needs ${CHAPTER_NAME.min} to ${CHAPTER_NAME.max} characters, or leave it empty for no chapter.` };
  }
  const existingChapter = existingSubject && chapterName ? (findByName(chapters.filter((c) => c.subject_id === existingSubject.id), chapterName) ?? null) : null;

  return { ok: true, subjectName, existingSubject, chapterName, existingChapter };
}
