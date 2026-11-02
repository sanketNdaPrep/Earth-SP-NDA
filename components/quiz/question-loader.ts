import { OPTION_LETTERS, type OptionLetter, type QuizQuestion } from './types';

/** Turns a raw `questions` row into the shape the player and the results page use. */
export function toQuestion(row: Record<string, unknown>): QuizQuestion {
  const letter = String(row.correct_option ?? '').trim().toUpperCase();
  const text = (value: unknown) => (value === null || value === undefined ? '' : String(value));
  return {
    id: String(row.id),
    question_text: text(row.question_text),
    option_a: text(row.option_a),
    option_b: text(row.option_b),
    option_c: text(row.option_c),
    option_d: text(row.option_d),
    correct_option: (OPTION_LETTERS as readonly string[]).includes(letter) ? (letter as OptionLetter) : null,
    explanation: typeof row.explanation === 'string' && row.explanation.trim() ? row.explanation : null,
    position: typeof row.position === 'number' ? row.position : null,
  };
}

/** Questions come back in the order the seeding page numbered them. */
export function sortByPosition(questions: QuizQuestion[]): QuizQuestion[] {
  return questions
    .map((question, order) => ({ question, order }))
    .sort((a, b) => {
      const pa = a.question.position ?? Number.MAX_SAFE_INTEGER;
      const pb = b.question.position ?? Number.MAX_SAFE_INTEGER;
      return pa - pb || a.order - b.order;
    })
    .map((item) => item.question);
}