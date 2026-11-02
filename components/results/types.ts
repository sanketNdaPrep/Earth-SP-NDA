import type { AttemptDetail } from '@/components/quiz/attempt-detail';
import type { OptionLetter, QuizQuestion, QuizRecord } from '@/components/quiz/types';
import type { SpeedClass } from './speed';

/** A row of `user_quiz_attempts`. `score` is the number of correct answers. */
export interface AttemptRecord {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  attempted_at: string | null;
}

export type ResultsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'missing' }
  | {
      status: 'ready';
      attempt: AttemptRecord;
      quiz: QuizRecord;
      questions: QuizQuestion[];
      /** The answers and timings saved in this browser, or null when this attempt was taken elsewhere. */
      detail: AttemptDetail | null;
      /** Accuracy (0 to 1) of every attempt on this module the database let this cadet read. */
      cohort: number[];
    };

export type ReviewStatus = 'correct' | 'wrong' | 'unattempted' | 'unscored' | 'unknown';

export interface ReviewItem {
  question: QuizQuestion;
  /** Position in the paper, starting at 0. */
  index: number;
  picked: OptionLetter | null;
  status: ReviewStatus;
  flagged: boolean;
  /** Seconds spent, null when timing was not saved. */
  seconds: number | null;
  speed: SpeedClass | null;
}

export type FilterKey = 'all' | 'incorrect' | 'unattempted' | 'flagged';