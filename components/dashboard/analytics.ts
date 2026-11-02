import type {
  AttemptRow,
  Overview,
  QuizSummary,
  RankTier,
  SubjectKey,
  SubjectStat,
  WeakModule,
} from './types';

// ---------------------------------------------------------------- parsing

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const num = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function parseQuiz(value: unknown): QuizSummary | null {
  // A joined row can arrive as an object or as a one-item array.
  const row = Array.isArray(value) ? value[0] : value;
  if (!isObject(row)) return null;
  return {
    id: row.id === undefined ? '' : String(row.id),
    title: typeof row.title === 'string' ? row.title : 'Practice drill',
    category: typeof row.category === 'string' ? row.category : 'General',
    time_limit_mins: typeof row.time_limit_mins === 'number' ? row.time_limit_mins : null,
  };
}

export function parseAttempt(value: unknown): AttemptRow | null {
  if (!isObject(value) || value.id === undefined || value.quiz_id === undefined) return null;
  return {
    id: String(value.id),
    quiz_id: String(value.quiz_id),
    score: num(value.score),
    total_questions: num(value.total_questions),
    attempted_at: typeof value.attempted_at === 'string' ? value.attempted_at : null,
    quiz: parseQuiz(value.quizzes),
  };
}

// ---------------------------------------------------------------- subjects

export const SUBJECT_LABELS: Record<SubjectKey, string> = {
  maths: 'NDA Maths',
  gat: 'GAT',
  english: 'English',
  other: 'Other exams',
};

export const SUBJECT_ORDER: readonly SubjectKey[] = ['maths', 'gat', 'english', 'other'];

/**
 * Which paper a module belongs to. Seeded NDA modules are named like "NDA Maths - Algebra"
 * or "GAT Physics", so the title decides. English is its own bucket for every exam.
 * CDS, AFCAT and SSB modules that are not English go to "Other exams".
 */
export function subjectOf(quiz: Pick<QuizSummary, 'title' | 'category'> | null): SubjectKey {
  if (!quiz) return 'other';
  const text = `${quiz.category} ${quiz.title}`.toLowerCase();
  if (/english/.test(text)) return 'english';
  const isNda = quiz.category.trim().toUpperCase() === 'NDA' || /\bnda\b|\bgat\b/.test(text);
  if (!isNda) return 'other';
  return /math/.test(text) ? 'maths' : 'gat';
}

const percent = (part: number, whole: number): number | null =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : null;

export function computeOverview(attempts: readonly AttemptRow[]): Overview {
  const aggregateScore = attempts.reduce((sum, item) => sum + item.score, 0);
  const aggregateQuestions = attempts.reduce((sum, item) => sum + item.total_questions, 0);
  const best = attempts.reduce<number | null>((top, item) => {
    const value = percent(item.score, item.total_questions);
    return value !== null && (top === null || value > top) ? value : top;
  }, null);
  return {
    attempts: attempts.length,
    aggregateScore,
    aggregateQuestions,
    accuracy: percent(aggregateScore, aggregateQuestions),
    bestAccuracy: best,
  };
}

export function subjectBreakdown(attempts: readonly AttemptRow[]): SubjectStat[] {
  return SUBJECT_ORDER.map((key) => {
    const rows = attempts.filter((item) => subjectOf(item.quiz) === key);
    const correct = rows.reduce((sum, item) => sum + item.score, 0);
    const questions = rows.reduce((sum, item) => sum + item.total_questions, 0);
    return {
      key,
      label: SUBJECT_LABELS[key],
      attempts: rows.length,
      correct,
      questions,
      accuracy: percent(correct, questions),
    };
  });
}

// -------------------------------------------------------------------- rank

export const RANK_TIERS: readonly RankTier[] = [
  { name: 'Recruit', blurb: 'Just enlisted. Take your first tests.', minAttempts: 0, minAccuracy: 0 },
  { name: 'Cadet', blurb: 'Training has begun.', minAttempts: 3, minAccuracy: 0 },
  { name: 'Senior Cadet', blurb: 'Steady practice and passing accuracy.', minAttempts: 10, minAccuracy: 50 },
  { name: 'Under Officer', blurb: 'Consistent and accurate under the clock.', minAttempts: 25, minAccuracy: 60 },
  { name: 'Cadet Captain', blurb: 'Top of the squadron.', minAttempts: 50, minAccuracy: 70 },
];

export interface RankProgress {
  tier: RankTier;
  tierIndex: number;
  next: RankTier | null;
  /** 0 to 100 toward the number of tests the next tier needs. */
  testsProgress: number;
  /** 0 to 100 toward the accuracy the next tier needs. */
  accuracyProgress: number;
}

export function rankProgress(overview: Overview): RankProgress {
  const accuracy = overview.accuracy ?? 0;
  let tierIndex = 0;
  RANK_TIERS.forEach((tier, index) => {
    if (overview.attempts >= tier.minAttempts && accuracy >= tier.minAccuracy) tierIndex = index;
  });
  const next = RANK_TIERS[tierIndex + 1] ?? null;
  const ratio = (have: number, need: number) => (need <= 0 ? 100 : Math.min(100, Math.round((have / need) * 100)));
  return {
    tier: RANK_TIERS[tierIndex],
    tierIndex,
    next,
    testsProgress: next ? ratio(overview.attempts, next.minAttempts) : 100,
    accuracyProgress: next ? ratio(accuracy, next.minAccuracy) : 100,
  };
}

// ---------------------------------------------------------- recommendations

/** The most recent attempt of each module, newest first. Rows arrive newest first already. */
function latestPerModule(attempts: readonly AttemptRow[]): AttemptRow[] {
  const seen = new Set<string>();
  const out: AttemptRow[] = [];
  for (const item of attempts) {
    if (seen.has(item.quiz_id)) continue;
    seen.add(item.quiz_id);
    out.push(item);
  }
  return out;
}

export const WEAK_BELOW_PERCENT = 60;

/** Modules where the latest attempt was below 60% accuracy, weakest first. */
export function weakModules(attempts: readonly AttemptRow[], limit = 3): WeakModule[] {
  return latestPerModule(attempts)
    .map((item) => ({ item, accuracy: percent(item.score, item.total_questions) }))
    .filter((entry): entry is { item: AttemptRow; accuracy: number } => entry.accuracy !== null && entry.accuracy < WEAK_BELOW_PERCENT)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
    .map(({ item, accuracy }) => ({
      quizId: item.quiz_id,
      title: item.quiz?.title ?? 'Practice drill',
      category: item.quiz?.category ?? 'General',
      accuracy,
      attemptedAt: item.attempted_at,
    }));
}

/**
 * Modules the cadet has not tried yet. Those in their target exam come first,
 * then those in the paper they are weakest in.
 */
export function pendingMocks(
  quizzes: readonly QuizSummary[],
  attempts: readonly AttemptRow[],
  targetExam: string,
  weakestSubject: SubjectKey | null,
  limit = 3,
): QuizSummary[] {
  const tried = new Set(attempts.map((item) => item.quiz_id));
  const target = targetExam.trim().toUpperCase();
  const rank = (quiz: QuizSummary): number => {
    const inTarget = quiz.category.trim().toUpperCase() === target ? 0 : 2;
    const inWeak = weakestSubject !== null && subjectOf(quiz) === weakestSubject ? 0 : 1;
    return inTarget + inWeak;
  };
  return quizzes
    .filter((quiz) => !tried.has(quiz.id))
    .map((quiz, order) => ({ quiz, order, rank: rank(quiz) }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, limit)
    .map((entry) => entry.quiz);
}

export function weakestSubject(stats: readonly SubjectStat[]): SubjectKey | null {
  const rated = stats.filter((stat) => stat.accuracy !== null && stat.key !== 'other');
  if (rated.length === 0) return null;
  return rated.reduce((low, stat) => ((stat.accuracy ?? 100) < (low.accuracy ?? 100) ? stat : low)).key;
}

// ---------------------------------------------------------------- formatting

const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatAttemptDate(value: string | null): string {
  if (!value) return 'Date not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not recorded' : dateFormat.format(date);
}