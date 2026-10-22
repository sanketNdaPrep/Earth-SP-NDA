export type Opt = 'A' | 'B' | 'C' | 'D';
export type FieldKey = 'question' | 'explanation' | Opt;
export type OptionsMap = Record<Opt, string>;
export type LoadState = 'loading' | 'ready' | 'error';

export interface Quiz {
  id: string;
  title: string;
  category: string;
}

export interface SessionEntry {
  n: number;
  topic: string;
  text: string;
  at: string;
}

export interface Banner {
  type: 'success' | 'error';
  text: string;
}

export type SeedMode = 'single' | 'bulk' | 'bank';

/** One line in the live quality checklist. `hint` explains a fail or warning. */
export interface Check {
  id: string;
  label: string;
  state: 'pass' | 'fail' | 'warn';
  hint?: string;
}

/** A question already stored in the selected module (read-only view). */
export interface ModuleQuestion {
  id: string;
  question_text: string;
  correct_option: Opt;
  position: number | null;
  explanation: string | null;
}

/** What gets autosaved to the browser while an admin is typing. */
export interface SeedDraft {
  savedAt: string;
  quizId: string;
  group: string;
  subject: string;
  question: string;
  options: OptionsMap;
  correct: Opt | null;
  explanation: string;
}