import { describe, expect, it } from 'vitest';
import { studyStreak } from '../lib/studyStreak';

const now = new Date(2026, 10, 15, 9, 30); // 15 Nov 2026, local time
const at = (day: number, hour = 12) => new Date(2026, 10, day, hour).toISOString();

describe('studyStreak', () => {
  it('is 0 with no activity', () => {
    expect(studyStreak([], now)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    expect(studyStreak([at(15), at(14), at(13)], now)).toBe(3);
  });

  it('counts several events on one day once', () => {
    expect(studyStreak([at(15, 8), at(15, 20), at(14)], now)).toBe(2);
  });

  it('keeps a streak that ends yesterday', () => {
    expect(studyStreak([at(14), at(13)], now)).toBe(2);
  });

  it('breaks after a missed day', () => {
    expect(studyStreak([at(15), at(13), at(12)], now)).toBe(1);
    expect(studyStreak([at(12), at(11)], now)).toBe(0);
  });

  it('ignores bad values and crosses month ends', () => {
    const early = new Date(2026, 11, 2, 9);
    const stamps = [new Date(2026, 11, 2, 7).toISOString(), new Date(2026, 11, 1, 7).toISOString(), new Date(2026, 10, 30, 7).toISOString(), 'nonsense', null, undefined];
    expect(studyStreak(stamps, early)).toBe(3);
  });
});
