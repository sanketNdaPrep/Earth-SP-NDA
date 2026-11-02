import type { AttemptDetail } from '@/components/quiz/attempt-detail';
import { scoreAttempt } from '@/components/quiz/scoring';
import type { AttemptResult, MarkingScheme, QuizQuestion } from '@/components/quiz/types';
import { classifySpeed, parSeconds, type SpeedClass } from './speed';
import { cohortPercentile, estimatePercentile, MIN_COHORT, type PercentileResult } from './rank-estimate';
import type { AttemptRecord, FilterKey, ReviewItem } from './types';

export interface Analysis {
  items: ReviewItem[];
  /** Marks, from the saved answers. Null when the details are not on this device. */
  result: AttemptResult | null;
  par: number;
  /** True when questions were added to or removed from the module after the attempt. */
  bankChanged: boolean;
  /** True when the answer key now gives a different score from the one that was logged. */
  scoreDiffers: boolean;
  speedCounts: Record<SpeedClass, number> | null;
  averageSeconds: number | null;
}

export function analyseAttempt(
  attempt: AttemptRecord,
  questions: readonly QuizQuestion[],
  detail: AttemptDetail | null,
  scheme: MarkingScheme,
  timeLimitMins: number | null,
): Analysis {
  const limitSecs = detail?.limitSecs ?? (timeLimitMins && timeLimitMins > 0 ? timeLimitMins * 60 : null);

  if (!detail) {
    return {
      items: questions.map((question, index) => ({
        question,
        index,
        picked: null,
        status: 'unknown',
        flagged: false,
        seconds: null,
        speed: null,
      })),
      result: null,
      par: parSeconds(limitSecs, attempt.total_questions || questions.length),
      bankChanged: false,
      scoreDiffers: false,
      speedCounts: null,
      averageSeconds: null,
    };
  }

  const taken = new Set(detail.questionIds);
  const paper = questions.filter((question) => taken.has(question.id));
  const bankChanged = paper.length !== detail.questionIds.length || paper.length !== questions.length;
  const par = parSeconds(limitSecs, detail.questionIds.length);

  const speedCounts: Record<SpeedClass, number> = { rush: 0, optimal: 0, slow: 0 };
  let totalSeconds = 0;
  let timed = 0;

  const items = paper.map<ReviewItem>((question, index) => {
    const picked = detail.answers[question.id] ?? null;
    const spentMs = detail.spentMs[question.id];
    const seconds = spentMs === undefined ? null : spentMs / 1000;
    const speed = seconds === null ? null : classifySpeed(seconds, par);
    if (speed !== null && seconds !== null) {
      speedCounts[speed] += 1;
      totalSeconds += seconds;
      timed += 1;
    }
    const status = !question.correct_option
      ? 'unscored'
      : picked === null
        ? 'unattempted'
        : picked === question.correct_option
          ? 'correct'
          : 'wrong';
    return { question, index, picked, status, flagged: Boolean(detail.marked[question.id]), seconds, speed };
  });

  const result = scoreAttempt(paper, detail.answers, scheme, detail.timeTakenSecs);

  return {
    items,
    result,
    par,
    bankChanged,
    scoreDiffers: result.correct !== attempt.score,
    speedCounts: timed > 0 ? speedCounts : null,
    averageSeconds: timed > 0 ? totalSeconds / timed : null,
  };
}

export function matchesFilter(item: ReviewItem, filter: FilterKey): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'incorrect':
      return item.status === 'wrong';
    case 'unattempted':
      return item.status === 'unattempted';
    case 'flagged':
      return item.flagged;
  }
}

/** Real percentile when enough attempts are readable, otherwise the estimate from net marks. */
export function percentileFor(
  attempt: AttemptRecord,
  result: AttemptResult | null,
  cohort: readonly number[],
): PercentileResult | null {
  const mine = attempt.total_questions > 0 ? attempt.score / attempt.total_questions : 0;
  // The cadet's own row is part of the group, so it is taken out before comparing.
  const others = [...cohort];
  const own = others.findIndex((value) => Math.abs(value - mine) < 1e-9);
  if (own !== -1) others.splice(own, 1);

  if (others.length >= MIN_COHORT) {
    return { value: cohortPercentile(others, mine), source: 'cohort', sample: others.length };
  }
  if (result && result.maxMarks > 0) {
    return { value: estimatePercentile((result.marks / result.maxMarks) * 100), source: 'estimate', sample: 0 };
  }
  return null;
}