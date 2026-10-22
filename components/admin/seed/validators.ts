import { OPTS } from './data';
import type { Check, Opt, OptionsMap } from './types';

export const LIMITS = {
  questionMin: 15,
  questionMax: 600,
  optionMax: 160,
  explanationMax: 1500,
};

export interface QuestionDraft {
  question: string;
  options: OptionsMap;
  correct: Opt | null;
  explanation: string;
  resUrl?: string;
  resTitle?: string;
}

/** Lower-case, collapse whitespace. Used to spot duplicate questions and options. */
export function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

const LATEX = /\\(frac|sqrt|theta|alpha|beta|pi|sum|int|times|cdot|left|right|degree)\b|\$\$?[^$\n]+\$\$?/;

const pass = (id: string, label: string): Check => ({ id, label, state: 'pass' });
const fail = (id: string, label: string, hint: string): Check => ({ id, label, state: 'fail', hint });
const warn = (id: string, label: string, hint: string): Check => ({ id, label, state: 'warn', hint });

/**
 * Runs every quality check on a question. `fail` blocks publishing,
 * `warn` is advice. `existing` is the text of questions already in the module.
 */
export function checkQuestion(draft: QuestionDraft, existing: string[] = []): Check[] {
  const checks: Check[] = [];
  const q = draft.question.trim();
  const texts = OPTS.map((o) => draft.options[o].trim());

  // Question body
  checks.push(q ? pass('question', 'Question written') : fail('question', 'Question written', 'Write the question body.'));
  if (q) {
    if (q.length < LIMITS.questionMin) {
      checks.push(warn('question-length', 'Question length', 'Very short. Check that the question is complete.'));
    } else if (q.length > LIMITS.questionMax) {
      checks.push(warn('question-length', 'Question length', `Over ${LIMITS.questionMax} characters. Long text is hard to read on a phone.`));
    } else {
      checks.push(pass('question-length', 'Question length'));
    }
  }

  // Options
  const missing = OPTS.filter((_, i) => !texts[i]);
  checks.push(
    missing.length === 0
      ? pass('options-filled', 'All four options filled')
      : fail('options-filled', 'All four options filled', `Option ${missing[0]} is empty.`),
  );

  const filled = texts.filter(Boolean).map(normalize);
  const hasDuplicate = new Set(filled).size !== filled.length;
  checks.push(
    hasDuplicate
      ? fail('options-unique', 'Options are different', 'Two options have the same text.')
      : pass('options-unique', 'Options are different'),
  );

  const longest = Math.max(0, ...texts.map((t) => t.length));
  checks.push(
    longest > LIMITS.optionMax
      ? warn('options-length', 'Option length', `An option is over ${LIMITS.optionMax} characters.`)
      : pass('options-length', 'Option length'),
  );

  // Answer
  checks.push(
    draft.correct
      ? pass('correct', 'Correct option marked')
      : fail('correct', 'Correct option marked', 'Mark the correct option.'),
  );

  // Formatting
  const usesLatex = [q, ...texts, draft.explanation].some((t) => LATEX.test(t));
  checks.push(
    usesLatex
      ? warn('latex', 'Plain text only', 'LaTeX found. The practice screen shows raw text, so use symbols like ², √, θ.')
      : pass('latex', 'Plain text only'),
  );

  // Solution
  const exp = draft.explanation.trim();
  if (!exp) {
    checks.push(warn('explanation', 'Solution added', 'No solution. Cadets learn more when you explain the steps.'));
  } else if (exp.length > LIMITS.explanationMax) {
    checks.push(warn('explanation', 'Solution added', `Over ${LIMITS.explanationMax} characters. Trim it.`));
  } else {
    checks.push(pass('explanation', 'Solution added'));
  }

  // Duplicates in the module
  if (q) {
    const key = normalize(q);
    checks.push(
      existing.some((e) => normalize(e) === key)
        ? warn('duplicate', 'Not already in module', 'This module already has a question with the same text.')
        : pass('duplicate', 'Not already in module'),
    );
  }

  // Optional resource link
  const url = (draft.resUrl ?? '').trim();
  if (url) {
    if (!(draft.resTitle ?? '').trim()) {
      checks.push(fail('resource-title', 'Resource titled', 'Give the attached resource a title.'));
    } else if (!/^https?:\/\//i.test(url)) {
      checks.push(warn('resource-url', 'Resource link', 'The link should start with http:// or https://.'));
    } else {
      checks.push(pass('resource', 'Resource link'));
    }
  }

  return checks;
}

export const hasFailures = (checks: Check[]): boolean => checks.some((c) => c.state === 'fail');

/** Message for the first blocking problem, or null when the question can be published. */
export function firstFailure(checks: Check[]): string | null {
  const bad = checks.find((c) => c.state === 'fail');
  return bad ? (bad.hint ?? bad.label) : null;
}