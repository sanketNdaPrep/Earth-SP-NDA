import { describe, expect, it } from 'vitest';
import { clampSeconds, marksFor, percentOf, scoreSubmission, type KeyEntry } from '../lib/mockScoring';

const key: KeyEntry[] = [
  { id: 'q1', correct: 'A' },
  { id: 'q2', correct: 'B' },
  { id: 'q3', correct: 'C' },
  { id: 'q4', correct: 'D' },
];

describe('scoreSubmission', () => {
  it('counts correct, wrong and unanswered', () => {
    const s = scoreSubmission(key, { q1: 'A', q2: 'C', q3: 'C' });
    expect(s).toMatchObject({ total: 4, correct: 2, wrong: 1, unanswered: 1 });
    expect(s.items.map((i) => i.chosen)).toEqual(['A', 'C', 'C', null]);
    expect(s.items.map((i) => i.correct)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('ignores unknown ids, bad letters and prototype keys', () => {
    const s = scoreSubmission(key, { q1: 'E', q2: 'b', q9: 'A', constructor: 'A', __proto__: 'A', q3: 3, q4: 'D' });
    expect(s).toMatchObject({ correct: 1, wrong: 0, unanswered: 3 });
  });

  it('survives junk input', () => {
    for (const junk of [null, undefined, 'A', 5, ['A', 'B']]) {
      expect(scoreSubmission(key, junk)).toMatchObject({ total: 4, correct: 0, unanswered: 4 });
    }
  });

  it('skips questions with no valid key', () => {
    const s = scoreSubmission([...key, { id: 'q5', correct: null }], { q5: 'A', q1: 'A' });
    expect(s.total).toBe(4);
    expect(s.items.find((i) => i.question_id === 'q5')).toBeUndefined();
  });
});

describe('percent, marks and time', () => {
  it('rounds percentages to one decimal', () => {
    expect(percentOf(1, 3)).toBe(33.3);
    expect(percentOf(7, 10)).toBe(70);
    expect(percentOf(0, 0)).toBe(0);
  });

  it('shares total marks equally with no negative marking', () => {
    expect(marksFor(7, 10, 30)).toBe(21);
    expect(marksFor(1, 3, 100)).toBe(33.33);
    expect(marksFor(0, 10, 30)).toBe(0);
    expect(marksFor(5, 0, 30)).toBe(0);
  });

  it('clamps time to the allowed limit and never below zero', () => {
    expect(clampSeconds(61_400, 7200)).toBe(61);
    expect(clampSeconds(9_000_000, 7200)).toBe(7200);
    expect(clampSeconds(-500, 7200)).toBe(0);
  });
});
