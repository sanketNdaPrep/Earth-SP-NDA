import { BULK_LIMIT, OPTS } from './data';
import { checkQuestion, normalize } from './validators';
import type { Opt, OptionsMap } from './types';

export interface ParsedRow {
  /** 1-based position in the pasted text. */
  index: number;
  question: string;
  options: OptionsMap;
  correct: Opt;
  explanation: string;
}

export interface ParseProblem {
  index: number;
  message: string;
}

export interface ParseResult {
  format: 'empty' | 'json' | 'blocks';
  rows: ParsedRow[];
  problems: ParseProblem[];
}

interface RawQuestion {
  question: string;
  options: OptionsMap;
  answer: string;
  explanation: string;
}

type Field = 'question' | 'answer' | 'explanation' | Opt;

const blank = (): RawQuestion => ({
  question: '',
  options: { A: '', B: '', C: '', D: '' },
  answer: '',
  explanation: '',
});

/* ------------------------------ Text blocks ------------------------------- */

// Matches "Q:", "Q1.", "Question:", "A)", "Option B:", "Ans:", "Exp:" at the start of a line.
const LABEL =
  /^\s*(q(?:uestion)?\s*\d*|option\s*[a-d]|[a-d]|ans(?:wer)?|correct|exp(?:lanation)?|solution)\s*[:.)]\s*(.*)$/i;

function fieldOf(label: string): Field {
  const l = label.toLowerCase().replace(/\s+/g, '');
  if (l.startsWith('q')) return 'question';
  if (l.startsWith('option')) return l.slice(6).toUpperCase() as Opt;
  if (l.startsWith('ans') || l === 'correct') return 'answer';
  if (l.startsWith('exp') || l === 'solution') return 'explanation';
  return l.toUpperCase() as Opt;
}

function assign(target: RawQuestion, field: Field, value: string, append: boolean): void {
  const join = (old: string) => (append ? `${old}\n${value}` : value);
  if (field === 'question') target.question = join(target.question);
  else if (field === 'answer') target.answer = join(target.answer);
  else if (field === 'explanation') target.explanation = join(target.explanation);
  else target.options[field] = join(target.options[field]);
}

function parseBlocks(text: string): RawQuestion[] {
  const all: RawQuestion[] = [];
  let current: RawQuestion | null = null;
  let last: Field | null = null;

  for (const line of text.split(/\r?\n/)) {
    const match = LABEL.exec(line);
    if (match) {
      const field = fieldOf(match[1]);
      // Every "Q:" starts a new question, so blank lines between blocks are optional.
      if (field === 'question' && current) all.push(current);
      if (field === 'question' || !current) current = blank();
      assign(current, field, match[2].trim(), false);
      last = field;
    } else if (line.trim() && current && last) {
      // A line without a label continues the previous field.
      assign(current, last, line.trim(), true);
    }
  }
  if (current) all.push(current);
  return all;
}

/* --------------------------------- JSON ----------------------------------- */

const asText = (value: unknown): string =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';

function fromJsonItem(item: unknown): RawQuestion {
  const raw = (item ?? {}) as Record<string, unknown>;
  const out = blank();
  out.question = asText(raw.question ?? raw.question_text ?? raw.q);
  out.answer = asText(raw.correct ?? raw.answer ?? raw.correct_option);
  out.explanation = asText(raw.explanation ?? raw.solution);

  const list = Array.isArray(raw.options) ? raw.options : null;
  const map = !list && raw.options && typeof raw.options === 'object' ? (raw.options as Record<string, unknown>) : null;
  OPTS.forEach((opt, i) => {
    const lower = opt.toLowerCase();
    out.options[opt] = asText(
      list ? list[i] : map ? (map[opt] ?? map[lower]) : (raw[lower] ?? raw[`option_${lower}`]),
    );
  });
  return out;
}

function parseJson(text: string): RawQuestion[] {
  const data: unknown = JSON.parse(text);
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { questions?: unknown }).questions)
      ? (data as { questions: unknown[] }).questions
      : null;
  if (!list) throw new SyntaxError('Expected an array of questions or an object with a "questions" array.');
  return list.map(fromJsonItem);
}

/* ------------------------------- Validation ------------------------------- */

/** "b", "B", "Option B", "(b)" or 1 to 4 all mean an option. Anything else is null. */
export function normalizeAnswer(raw: string): Opt | null {
  const cleaned = raw.trim().replace(/^option\s*/i, '').replace(/[()\s.]/g, '');
  if (!cleaned) return null;
  const letter = cleaned[0].toUpperCase();
  if (cleaned.length === 1 && (OPTS as string[]).includes(letter)) return letter as Opt;
  if (/^[1-4]$/.test(cleaned)) return OPTS[Number(cleaned) - 1];
  return null;
}

/* --------------------------------- Public --------------------------------- */

/** Parses pasted text (labelled blocks) or JSON into rows ready to insert, plus problems. */
export function parseBulk(input: string): ParseResult {
  const text = input.trim();
  if (!text) return { format: 'empty', rows: [], problems: [] };

  const looksJson = text.startsWith('[') || text.startsWith('{');
  let raws: RawQuestion[];
  try {
    raws = looksJson ? parseJson(text) : parseBlocks(text);
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    return { format: 'json', rows: [], problems: [{ index: 0, message: `Invalid JSON: ${reason}` }] };
  }

  const format = looksJson ? 'json' : 'blocks';
  if (raws.length === 0) {
    return {
      format,
      rows: [],
      problems: [{ index: 0, message: 'No questions found. Start each question with "Q:".' }],
    };
  }

  const rows: ParsedRow[] = [];
  const problems: ParseProblem[] = [];
  const seen = new Map<string, number>();

  if (raws.length > BULK_LIMIT) {
    problems.push({ index: 0, message: `Only the first ${BULK_LIMIT} questions are read. Import the rest in a second batch.` });
  }

  raws.slice(0, BULK_LIMIT).forEach((raw, i) => {
    const index = i + 1;
    const correct = normalizeAnswer(raw.answer);
    const failures = checkQuestion(
      { question: raw.question, options: raw.options, correct, explanation: raw.explanation },
    ).filter((c) => c.state === 'fail');

    if (!correct && raw.answer.trim()) {
      problems.push({ index, message: `"${raw.answer.trim()}" is not a valid answer. Use A, B, C or D.` });
    } else if (failures.length > 0) {
      problems.push({ index, message: failures.map((c) => c.hint ?? c.label).join(' ') });
    }
    if (!correct || failures.some((c) => c.id !== 'correct')) return;

    const key = normalize(raw.question);
    const earlier = seen.get(key);
    if (earlier) {
      problems.push({ index, message: `Same text as question ${earlier} in this batch.` });
      return;
    }
    seen.set(key, index);

    rows.push({
      index,
      question: raw.question.trim(),
      options: {
        A: raw.options.A.trim(),
        B: raw.options.B.trim(),
        C: raw.options.C.trim(),
        D: raw.options.D.trim(),
      },
      correct,
      explanation: raw.explanation.trim(),
    });
  });

  return { format, rows, problems };
}