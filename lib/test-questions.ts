import { isCompleteDraft, OPTION_LETTERS, type DraftQuestion, type OptionLetter, type PageSpan } from "./pdf-questions";

/** One question in the test builder: typed by hand, read from a PDF, or borrowed from the shared bank. */
export interface BuilderQuestion {
  /** Stays the same while the admin edits, so the screen keeps its place. */
  key: string;
  /** The saved question's id. null until it is saved. */
  id: string | null;
  /** Made for this test, so it can be edited and deleted here. false for a shared bank question, which is only linked. */
  owned: boolean;
  text: string;
  options: Record<OptionLetter, string>;
  correct: OptionLetter | "";
  explanation: string;
  /** A label like "Statement-Based". Saved as the question's topic. */
  tag: string;
  /** What the PDF reader was not sure of. Cleared when the admin edits the question. */
  flags: string[];
  /** Where the question sits in the uploaded PDF. Only for questions read from a PDF in this session. */
  spans?: PageSpan[];
  /** For a shared bank question: the module it comes from. */
  moduleTitle?: string;
}

export const TAG_MAX = 60;

let counter = 0;
export function newKey(): string {
  counter += 1;
  return `q${Date.now().toString(36)}${counter}`;
}

export function blankQuestion(): BuilderQuestion {
  return { key: newKey(), id: null, owned: true, text: "", options: { A: "", B: "", C: "", D: "" }, correct: "", explanation: "", tag: "", flags: [] };
}

export function fromDraft(draft: DraftQuestion): BuilderQuestion {
  return {
    key: newKey(),
    id: null,
    owned: true,
    text: draft.text,
    options: { ...draft.options },
    correct: draft.correct ?? "",
    explanation: draft.explanation,
    tag: draft.tag.slice(0, TAG_MAX),
    flags: draft.flags,
    spans: draft.spans,
  };
}

/** What stops this question from being saved. Empty when it is finished. Shared bank questions are always fine. */
export function questionProblems(q: BuilderQuestion): string[] {
  if (!q.owned) return [];
  const problems: string[] = [];
  if (!q.text.trim()) problems.push("Write the question.");
  const missing = OPTION_LETTERS.filter((l) => !q.options[l].trim());
  if (missing.length > 0) problems.push(`Fill in option ${missing.join(", ")}.`);
  if (!q.correct) problems.push("Choose the correct option.");
  else if (!q.options[q.correct].trim()) problems.push(`The correct option ${q.correct} is empty.`);
  const same = OPTION_LETTERS.filter((l, i) => q.options[l].trim() && OPTION_LETTERS.some((m, j) => j < i && q.options[m].trim().toLowerCase() === q.options[l].trim().toLowerCase()));
  if (same.length > 0) problems.push(`Option ${same.join(", ")} repeats an earlier option.`);
  if (q.tag.length > TAG_MAX) problems.push(`Keep the label under ${TAG_MAX} characters.`);
  return problems;
}

/** Counts for the summary line above the list. */
export function summarise(list: readonly BuilderQuestion[]): { total: number; ready: number; needWork: number; flagged: number } {
  const owned = list.filter((q) => q.owned);
  const needWork = owned.filter((q) => questionProblems(q).length > 0).length;
  return { total: list.length, ready: list.length - needWork, needWork, flagged: list.filter((q) => q.flags.length > 0).length };
}

/** A fingerprint of what would be saved, to tell edited questions from untouched ones. */
export function signatureOf(q: BuilderQuestion): string {
  return JSON.stringify([q.text, q.options.A, q.options.B, q.options.C, q.options.D, q.correct, q.explanation, q.tag]);
}

export function isDraftReady(draft: DraftQuestion): boolean {
  return isCompleteDraft(draft);
}

/** Moves one item. Returns the same array when the move is not possible. */
export function moveItem<T>(list: readonly T[], index: number, by: -1 | 1): T[] {
  const target = index + by;
  if (target < 0 || target >= list.length) return [...list];
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Inserts an item after `index` (or at the end when index is -1 or past the end). */
export function insertAfter<T>(list: readonly T[], index: number, item: T): T[] {
  const at = index < 0 || index >= list.length ? list.length : index + 1;
  return [...list.slice(0, at), item, ...list.slice(at)];
}

const fingerprint = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 80);

/**
 * Fills explanations that are still empty from a re-read of the saved PDF. A question is matched by its text,
 * or by its position when the PDF and the test have the same number of questions. An explanation already
 * written is never replaced.
 */
export function fillMissingExplanations(list: readonly BuilderQuestion[], drafts: readonly DraftQuestion[]): { list: BuilderQuestion[]; filled: number } {
  const owned = list.filter((q) => q.owned);
  const samePlace = owned.length === drafts.length;
  const byText = new Map<string, DraftQuestion>();
  for (const d of drafts) byText.set(fingerprint(d.text), d);
  let filled = 0;
  let place = -1;
  const next = list.map((q) => {
    if (!q.owned) return q;
    place += 1;
    if (q.explanation.trim()) return q;
    const draft = byText.get(fingerprint(q.text)) ?? (samePlace ? drafts[place] : undefined);
    if (!draft || !draft.explanation.trim()) return q;
    filled += 1;
    return { ...q, explanation: draft.explanation };
  });
  return { list: next, filled };
}
