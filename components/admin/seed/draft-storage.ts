import type { Opt, OptionsMap, SeedDraft } from './types';

const KEY = 'earth-sp-nda:seed-draft:v1';

export type DraftInput = Omit<SeedDraft, 'savedAt'>;

const isOpt = (value: unknown): value is Opt =>
  value === 'A' || value === 'B' || value === 'C' || value === 'D';

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

export function isEmptyDraft(d: DraftInput): boolean {
  return (
    !d.question.trim() &&
    !d.explanation.trim() &&
    d.correct === null &&
    Object.values(d.options).every((o) => !o.trim())
  );
}

/** Returns the saved draft, or null if nothing valid is stored. Never throws. */
export function loadDraft(): SeedDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, unknown>;
    const opts = (data.options ?? {}) as Record<string, unknown>;
    const options: OptionsMap = { A: str(opts.A), B: str(opts.B), C: str(opts.C), D: str(opts.D) };
    return {
      savedAt: str(data.savedAt) || new Date().toISOString(),
      quizId: str(data.quizId),
      group: str(data.group),
      subject: str(data.subject),
      question: str(data.question),
      options,
      correct: isOpt(data.correct) ? data.correct : null,
      explanation: str(data.explanation),
    };
  } catch {
    return null;
  }
}

/** Saves the draft. Returns what was stored, or null if storage is unavailable. */
export function saveDraft(input: DraftInput): SeedDraft | null {
  try {
    const draft: SeedDraft = { ...input, savedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY, JSON.stringify(draft));
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: nothing to clear */
  }
}