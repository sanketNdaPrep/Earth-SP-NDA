/** Shared types for the cadet test engine. */

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;
export type OptionLetter = (typeof OPTION_LETTERS)[number];

/** A row of the `quizzes` table. */
export interface QuizRecord {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  time_limit_mins: number | null;
}

/** A row of the `questions` table, normalised by the loader. */
export interface QuizQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  /** null when the stored value is not A to D. Such a question is never scored. */
  correct_option: OptionLetter | null;
  explanation: string | null;
  position: number | null;
}

/** Answers and flags are keyed by question id, so a reordered bank cannot shift them. */
export type AnswerMap = Record<string, OptionLetter>;
export type FlagMap = Record<string, true>;

export type PaletteStatus =
  | 'unvisited'
  | 'unanswered'
  | 'answered'
  | 'marked'
  | 'answered-marked'
  | 'correct'
  | 'wrong'
  | 'skipped';

export interface MarkingScheme {
  id: 'nda-maths' | 'gat' | 'cds' | 'afcat' | 'practice';
  /** Short name shown as the exam mode, for example "NDA Maths". */
  label: string;
  /** Marks for a correct answer. */
  correct: number;
  /** Marks deducted for a wrong answer, as a positive number. */
  wrong: number;
}

export interface AttemptResult {
  total: number;
  scorable: number;
  correct: number;
  wrong: number;
  unanswered: number;
  attempted: number;
  /** Marks gained from correct answers. */
  gained: number;
  /** Marks lost to negative marking, as a positive number. */
  deducted: number;
  /** gained - deducted. Can be below zero. */
  marks: number;
  maxMarks: number;
  /** correct / attempted, as a percentage. null when nothing was attempted. */
  accuracy: number | null;
  timeTakenSecs: number;
}

export type LogState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'saved' }
  | { status: 'guest' }
  | { status: 'error'; message: string };