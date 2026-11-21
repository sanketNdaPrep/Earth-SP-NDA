/** Subjects and their chapters, as the pickers and the student pages use them. */
export interface TaxSubject {
  id: string;
  name: string;
  sort_order: number;
  cover_path: string | null;
  exams: string[];
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  sort_order: number;
  /** Optional cover picture, in the subject-covers bucket. */
  cover_path?: string | null;
}

export const CHAPTER_NAME = { min: 2, max: 60 } as const;

/** Why a chapter name cannot be used, or null. Names are unique inside a subject, ignoring case. */
export function chapterNameProblem(name: string, siblings: readonly Pick<Chapter, "id" | "name">[], editingId?: string): string | null {
  const clean = name.trim();
  if (clean.length < CHAPTER_NAME.min || clean.length > CHAPTER_NAME.max) {
    return `A chapter name must be ${CHAPTER_NAME.min} to ${CHAPTER_NAME.max} characters.`;
  }
  if (siblings.some((c) => c.id !== editingId && c.name.trim().toLowerCase() === clean.toLowerCase())) {
    return "This subject already has a chapter with that name.";
  }
  return null;
}

export function sortChapters<T extends Pick<Chapter, "name" | "sort_order">>(chapters: readonly T[]): T[] {
  return [...chapters].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

export interface Filed {
  subject_id: string | null;
  chapter_id: string | null;
}

export interface Section<T> {
  key: string;
  subjectId: string | null;
  subjectName: string;
  chapters: { key: string; chapterId: string | null; chapterName: string | null; items: T[] }[];
}

/**
 * Groups filed items as Subject, then Chapter. Items with no subject go last under "Other".
 * Items with a subject but no chapter sit first inside that subject, with no chapter heading.
 */
export function groupBySubject<T extends Filed>(items: readonly T[], subjects: readonly TaxSubject[], chapters: readonly Chapter[]): Section<T>[] {
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const chapterById = new Map(chapters.map((c) => [c.id, c]));
  const bySubject = new Map<string | null, T[]>();
  for (const item of items) {
    const key = item.subject_id && subjectById.has(item.subject_id) ? item.subject_id : null;
    bySubject.set(key, [...(bySubject.get(key) ?? []), item]);
  }

  const ordered = [...subjects].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const sections: Section<T>[] = [];
  for (const subject of [...ordered.map((s) => s.id), null]) {
    const members = bySubject.get(subject);
    if (!members?.length) continue;
    const byChapter = new Map<string | null, T[]>();
    for (const m of members) {
      const key = m.chapter_id && chapterById.has(m.chapter_id) ? m.chapter_id : null;
      byChapter.set(key, [...(byChapter.get(key) ?? []), m]);
    }
    const chapterOrder = sortChapters(chapters.filter((c) => c.subject_id === subject)).map((c) => c.id);
    const groups = [null, ...chapterOrder]
      .filter((id) => byChapter.has(id))
      .map((id) => ({
        key: id ?? "none",
        chapterId: id,
        chapterName: id ? (chapterById.get(id)?.name ?? null) : null,
        items: byChapter.get(id) ?? [],
      }));
    sections.push({ key: subject ?? "other", subjectId: subject, subjectName: subject ? (subjectById.get(subject)?.name ?? "Other") : "Other", chapters: groups });
  }
  return sections;
}

export interface ChapterFolder {
  id: string;
  name: string;
  cover_path?: string | null;
  count: number;
}

export interface SubjectFolder {
  subject: TaxSubject;
  chapters: ChapterFolder[];
  /** Items filed under the subject but under no chapter. */
  looseCount: number;
  count: number;
}

/**
 * One folder per subject, in the admin's order, whether or not it holds anything yet.
 * Each folder lists every chapter of the subject (empty ones too) with how many items it holds.
 */
export function buildFolders(items: readonly Filed[], subjects: readonly TaxSubject[], chapters: readonly Chapter[]): SubjectFolder[] {
  const ordered = [...subjects].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  return ordered.map((subject) => {
    const own = chapters.filter((c) => c.subject_id === subject.id);
    const chapterIds = new Set(own.map((c) => c.id));
    const inSubject = items.filter((i) => i.subject_id === subject.id);
    const chapterFolders = sortChapters(own).map((c) => ({ id: c.id, name: c.name, cover_path: c.cover_path ?? null, count: inSubject.filter((i) => i.chapter_id === c.id).length }));
    const looseCount = inSubject.filter((i) => !i.chapter_id || !chapterIds.has(i.chapter_id)).length;
    return { subject, chapters: chapterFolders, looseCount, count: inSubject.length };
  });
}

/** An item with no exam tags is for everyone. A tagged item shows only under the exams it is tagged with. */
export function itemInExam(itemExams: readonly string[] | null | undefined, exam: string | null): boolean {
  if (!exam) return true;
  const tags = itemExams ?? [];
  return tags.length === 0 || tags.includes(exam);
}

/**
 * Whether a subject folder shows under an exam: the subject is for that exam, or for no exam in particular,
 * or one of its items is tagged for that exam.
 */
export function subjectInExam(subject: Pick<TaxSubject, "id" | "exams">, items: readonly { subject_id: string | null; exams?: readonly string[] | null }[], exam: string | null): boolean {
  if (!exam) return true;
  if (subject.exams.length === 0 || subject.exams.includes(exam)) return true;
  return items.some((i) => i.subject_id === subject.id && (i.exams ?? []).includes(exam));
}

export interface ChapterListResult {
  /** Names ready to add, in the order pasted. */
  names: string[];
  /** Lines left out, with the reason. */
  skipped: { line: string; reason: string }[];
}

/**
 * Turns a pasted list (one chapter per line, bullets and "1." numbering allowed) into chapter names.
 * Leaves out blank lines, names that are too short or long, repeats within the list and chapters that already exist.
 */
export function parseChapterList(text: string, existing: readonly Pick<Chapter, "name">[]): ChapterListResult {
  const seen = new Set(existing.map((c) => c.name.trim().toLowerCase()));
  const names: string[] = [];
  const skipped: { line: string; reason: string }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const name = raw.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").replace(/\s+/g, " ").trim();
    if (!name) continue;
    if (name.length < CHAPTER_NAME.min || name.length > CHAPTER_NAME.max) {
      skipped.push({ line: name, reason: `needs ${CHAPTER_NAME.min} to ${CHAPTER_NAME.max} characters` });
    } else if (seen.has(name.toLowerCase())) {
      skipped.push({ line: name, reason: "already in the list" });
    } else {
      seen.add(name.toLowerCase());
      names.push(name);
    }
  }
  return { names, skipped };
}
