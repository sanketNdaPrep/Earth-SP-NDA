/** Shared types for the cadet dashboard. */

export interface QuizSummary {
  id: string;
  title: string;
  category: string;
  time_limit_mins: number | null;
}

/** One row of `user_quiz_attempts`, with its module when the join worked. */
export interface AttemptRow {
  id: string;
  quiz_id: string;
  /** Correct answers. The quiz player logs the count, not marks. */
  score: number;
  total_questions: number;
  attempted_at: string | null;
  quiz: QuizSummary | null;
}

export interface CadetProfile {
  id: string;
  fullName: string;
  email: string;
  targetExam: string;
}

export type SubjectKey = 'maths' | 'gat' | 'english' | 'other';

export interface SubjectStat {
  key: SubjectKey;
  label: string;
  attempts: number;
  correct: number;
  questions: number;
  /** 0 to 100, null when no attempts yet. */
  accuracy: number | null;
}

export interface Overview {
  attempts: number;
  /** Total correct answers across every attempt. */
  aggregateScore: number;
  /** Total questions across every attempt. */
  aggregateQuestions: number;
  /** 0 to 100, null before the first attempt. */
  accuracy: number | null;
  /** Best single attempt, as a percentage. */
  bestAccuracy: number | null;
}

export interface RankTier {
  name: string;
  /** Short line describing the tier. */
  blurb: string;
  minAttempts: number;
  minAccuracy: number;
}

export interface WeakModule {
  quizId: string;
  title: string;
  category: string;
  accuracy: number;
  attemptedAt: string | null;
}

export type DashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      profile: CadetProfile;
      attempts: AttemptRow[];
      quizzes: QuizSummary[];
      /** True when the module list could not be loaded, so recommendations are limited. */
      quizzesFailed: boolean;
    };