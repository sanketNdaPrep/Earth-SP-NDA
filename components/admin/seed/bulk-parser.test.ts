import { describe, expect, it } from 'vitest';
import { normalizeAnswer, parseBulk } from '../components/admin/seed/bulk-parser';

describe('normalizeAnswer', () => {
  it('parses valid letter answers', () => {
    expect(normalizeAnswer('A')).toBe('A');
    expect(normalizeAnswer('b')).toBe('B');
    expect(normalizeAnswer(' Option C.')).toBe('C');
    expect(normalizeAnswer('(d)')).toBe('D');
  });

  it('parses numeric option indicators', () => {
    expect(normalizeAnswer('1')).toBe('A');
    expect(normalizeAnswer('2')).toBe('B');
    expect(normalizeAnswer('3')).toBe('C');
    expect(normalizeAnswer('4')).toBe('D');
  });

  it('rejects invalid inputs', () => {
    expect(normalizeAnswer('')).toBeNull();
    expect(normalizeAnswer('E')).toBeNull();
    expect(normalizeAnswer('Option 5')).toBeNull();
  });
});

describe('parseBulk', () => {
  it('parses structured block text questions correctly', () => {
    const input = `Q: What is sin(90°)?
A: 0
B: 1
C: -1
D: 0.5
Ans: B
Exp: sin(90°) = 1.`;

    const result = parseBulk(input);
    expect(result.format).toBe('blocks');
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].correct).toBe('B');
    expect(result.rows[0].question).toBe('What is sin(90°)?');
  });

  it('parses structured JSON strings correctly', () => {
    const json = JSON.stringify([
      {
        question: 'Derivative of x²?',
        options: ['x', '2x', 'x²', '2'],
        answer: 'B',
        explanation: 'Power rule.',
      },
    ]);

    const result = parseBulk(json);
    expect(result.format).toBe('json');
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].correct).toBe('B');
    expect(result.rows[0].options.B).toBe('2x');
  });
});