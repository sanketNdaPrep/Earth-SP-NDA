import type { AnswerMap, AttemptResult, MarkingScheme, QuizQuestion, QuizRecord } from './types';

/**
 * Marking schemes. NDA Maths and GAT use the values the exam publishes
 * (2.5 / -0.83 and 4 / -1.33). CDS, AFCAT and the practice fallback are
 * sensible defaults: edit them here and nothing else needs to change.
 */
export const SCHEMES: Record<MarkingScheme['id'], MarkingScheme> = {
  'nda-maths': { id: 'nda-maths', label: 'NDA Maths', correct: 2.5, wrong: 0.83 },
  gat: { id: 'gat', label: 'GAT and English', correct: 4, wrong: 1.33 },
  cds: { id: 'cds', label: 'CDS', correct: 1, wrong: 0.33 },
  afcat: { id: 'afcat', label: 'AFCAT', correct: 3, wrong: 1 },
  practice: { id: 'practice', label: 'Practice', correct: 1, wrong: 0 },
};

/**
 * Picks the scheme from the module's category and title. Seeded NDA modules read
 * like "NDA Maths - Algebra" or "GAT Physics", so the title decides between Maths
 * and GAT. English is part of the GAT paper, so it takes the GAT scheme.
 */
export function resolveMarkingScheme(quiz: Pick<QuizRecord, 'title' | 'category'>): MarkingScheme {
  const category = quiz.category.trim().toUpperCase();
  const text = `${quiz.category} ${quiz.title}`.toLowerCase();

  if (category === 'CDS') return SCHEMES.cds;
  if (category === 'AFCAT') return SCHEMES.afcat;
  if (category === 'NDA' || /\bnda\b/.test(text)) {
    return /math/.test(text) ? SCHEMES['nda-maths'] : SCHEMES.gat;
  }
  return SCHEMES.practice;
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function scoreAttempt(
  questions: readonly QuizQuestion[],
  answers: AnswerMap,
  scheme: MarkingScheme,
  timeTakenSecs: number,
): AttemptResult {
  let scorable = 0;
  let correct = 0;
  let wrong = 0;

  for (const question of questions) {
    if (!question.correct_option) continue;
    scorable += 1;
    const picked = answers[question.id];
    if (!picked) continue;
    if (picked === question.correct_option) correct += 1;
    else wrong += 1;
  }

  const gained = round2(correct * scheme.correct);
  const deducted = round2(wrong * scheme.wrong);

  return {
    total: questions.length,
    scorable,
    correct,
    wrong,
    unanswered: scorable - correct - wrong,
    attempted: correct + wrong,
    gained,
    deducted,
    marks: round2(gained - deducted),
    maxMarks: round2(scorable * scheme.correct),
    accuracy: correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 1000) / 10 : null,
    timeTakenSecs,
  };
}

const marksFormat = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 25.85, -4.15, 150.00 */
export function formatMarks(value: number): string {
  return marksFormat.format(value);
}

/** 2:30:00 for long papers, 04:07 for short ones. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "2 h 30 min" or "45 min" for the briefing screen. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}