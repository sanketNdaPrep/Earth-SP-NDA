import { describe, expect, it } from 'vitest';
import { checkQuestion, firstFailure, hasFailures, normalize } from '../components/admin/seed/validators';

describe('normalize', () => {
  it('collapses whitespace and forces lowercase', () => {
    expect(normalize('  Find   the   VALUE  ')).toBe('find the value');
  });
});

describe('checkQuestion & failure detection', () => {
  it('detects missing correct option', () => {
    const checks = checkQuestion({
      question: 'Valid question text with sufficient length',
      options: { A: '1', B: '2', C: '3', D: '4' },
      correct: null,
      explanation: 'Some explanation text',
    });

    expect(hasFailures(checks)).toBe(true);
    expect(firstFailure(checks)).toBe('Mark the correct option.');
  });

  it('passes completely valid question drafts', () => {
    const checks = checkQuestion({
      question: 'What is the derivative of x² with respect to x?',
      options: { A: 'x', B: '2x', C: 'x²', D: '2' },
      correct: 'B',
      explanation: 'Using standard power rule d/dx x^n = n*x^(n-1).',
    });

    expect(hasFailures(checks)).toBe(false);
    expect(firstFailure(checks)).toBeNull();
  });
});