/**
 * Turns the text of a question PDF into questions, options, answers and explanations.
 *
 * Input is the text pdf.js finds on each page, with its position. Output is a list of draft questions,
 * each with notes about anything the reader was not sure of, so the admin checks it in a preview
 * before saving. The reader never guesses silently: a missing answer or option is flagged.
 *
 * Runs in tests and in the browser.
 */

import { joinBrokenFormulas, mathFlags } from "./pdf-math-check";

export type OptionLetter = "A" | "B" | "C" | "D";
export const OPTION_LETTERS: readonly OptionLetter[] = ["A", "B", "C", "D"];

/** One piece of text on a page. y counts down from the top of the page. */
export interface TextItem {
  page: number;
  x: number;
  y: number;
  /** Width of the text on the page. */
  w: number;
  /** Height of the page, to tell page headers and footers from content. */
  pageHeight: number;
  str: string;
  /** Font size in points. Only the maths reader needs it. */
  size?: number;
}

export interface DraftQuestion {
  /** The number printed in the PDF (Q01 is 1). */
  number: number;
  /** A label printed beside the number, like "Statement-Based". Empty when there is none. */
  tag: string;
  text: string;
  options: Record<OptionLetter, string>;
  correct: OptionLetter | null;
  explanation: string;
  /** What the reader was not sure of, in plain words. Empty when everything was found. */
  flags: string[];
  /** Where the question sits in the PDF, so the preview can show the original picture of it. */
  spans?: PageSpan[];
}

/** A strip of one page, as fractions of the page height (0 is the top). */
export interface PageSpan {
  page: number;
  top: number;
  bottom: number;
}

export interface ParseResult {
  questions: DraftQuestion[];
  /** Things about the whole file, like a count that does not match the cover page. */
  warnings: string[];
}

// ---------------------------------------------------------------------------------------------
// Text clean-up
// ---------------------------------------------------------------------------------------------

/**
 * Some PDFs use a font whose letters come out as private-use symbols (Q01 arrives as Q + two symbols).
 * Those symbols sit a fixed distance above the normal character, so they can be turned back.
 */
export function decodeText(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0xe000 && code <= 0xf8ff) {
      const plain = code - 0xe041;
      out += plain >= 0x20 && plain <= 0x7e ? String.fromCharCode(plain) : "";
    } else {
      out += ch;
    }
  }
  return out;
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
/** Closes up the space a PDF leaves before commas and closing brackets and after opening ones. */
const tidy = (s: string) => s.replace(/[ \t]+([,;.!?)\]])/g, "$1").replace(/([(\[])[ \t]+/g, "$1");

interface Cell {
  x: number;
  w: number;
  str: string;
}

interface Line {
  page: number;
  y: number;
  cells: Cell[];
  text: string;
}

/** Items on the same row of a page become one line. Rows within 3 points of each other are the same row. */
function buildLines(items: TextItem[]): Line[] {
  const sorted = [...items].sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);
  const lines: Line[] = [];
  for (const item of sorted) {
    const str = decodeText(item.str);
    if (!str.trim()) continue;
    const last = lines[lines.length - 1];
    const cell: Cell = { x: item.x, w: item.w, str };
    if (last && last.page === item.page && Math.abs(last.y - item.y) <= 3) {
      last.cells.push(cell);
    } else {
      lines.push({ page: item.page, y: item.y, cells: [cell], text: "" });
    }
  }
  for (const line of lines) {
    line.cells.sort((a, b) => a.x - b.x);
    let text = "";
    let end = Number.NEGATIVE_INFINITY;
    for (const c of line.cells) {
      const gap = c.x - end;
      text += (text && gap > 1.2 && !/\s$/.test(text) && !/^\s/.test(c.str) && !/^[,.;:!?)\]]/.test(c.str) ? " " : "") + c.str;
      end = c.x + c.w;
    }
    line.text = clean(text).replace(/\s+([,;:.!?)\]])/g, "$1").replace(/([(\[])\s+/g, "$1");
  }
  return lines;
}

/** Headers and footers that repeat on every page ("Page 3 of 17") are removed. */
function dropPageFurniture(items: TextItem[]): TextItem[] {
  const pages = new Set(items.map((i) => i.page)).size;
  if (pages < 3) return items;
  const edge = (i: TextItem) => i.y < i.pageHeight * 0.06 || i.y > i.pageHeight * 0.93;
  const seen = new Map<string, Set<number>>();
  for (const i of items) {
    if (!edge(i)) continue;
    const key = clean(decodeText(i.str)).replace(/\d+/g, "#");
    if (!key) continue;
    if (!seen.has(key)) seen.set(key, new Set());
    seen.get(key)?.add(i.page);
  }
  const repeated = new Set([...seen].filter(([, set]) => set.size >= Math.max(3, Math.floor(pages * 0.4))).map(([key]) => key));
  return items.filter((i) => !(edge(i) && repeated.has(clean(decodeText(i.str)).replace(/\d+/g, "#"))));
}

// ---------------------------------------------------------------------------------------------
// Finding the questions
// ---------------------------------------------------------------------------------------------

const Q_HEADER = /^Q\.?\s*(\d{1,4})\b\s*[.):\-–]?\s*(.*)$/i;
const NUM_HEADER = /^(\d{1,4})\s*[.)]\s+(\S.*)$/;
const OPTION_MARK = /^\(?([A-Da-d])[).]\)?$/;
const OPTION_INLINE = /^\(?([A-Da-d])[).]\s+(\S.*)$/;
const KEY_HEADING = /^(?:answer\s*key|answers?(?:\s*&\s*(?:explanations?|solutions?))?|solutions?\s*&?\s*answers?)\b/i;
const INLINE_ANSWER = /^(?:ans(?:wer)?|correct\s*(?:answer|option))\s*[:.\-–]\s*\(?([A-Da-d])\)?\b\.?\s*(.*)$/i;
const INLINE_EXPLANATION = /^(?:explanation|solution|sol|exp|reason)\s*[:.\-–]\s*(.*)$/i;
const PICTURE_HINT = /\b(figure|diagram|image|picture|graph|circuit|shown\s+(?:below|above|in)|given\s+(?:below|above)\s+(?:figure|diagram|graph))\b/i;

function isOptionMarker(cell: Cell): OptionLetter | null {
  const m = OPTION_MARK.exec(cell.str.trim());
  return m ? (m[1].toUpperCase() as OptionLetter) : null;
}

/** Lines that start a statement or a new sentence are kept on their own row; wrapped lines are joined. */
function joinWrapped(lines: string[]): string {
  const rows: string[] = [];
  for (const raw of lines) {
    const line = clean(raw);
    if (!line) continue;
    const prev = rows[rows.length - 1];
    const startsNew = /^(?:\d+\s*[.)]|\(?[ivxIVX]+\)|[A-Da-d][.)]|[•\-–*]|(?:Statement|Assertion|Reason|Column|List)\b|(?:Which|What|How|Why|Who|Where|When|Select|Choose|Identify|Find|Arrange|Match|Consider|Given)\b)/.test(line);
    if (prev === undefined || startsNew || /[.?:!;]$/.test(prev)) rows.push(line);
    else rows[rows.length - 1] = `${prev} ${line}`;
  }
  return rows.join("\n");
}

interface Block {
  number: number;
  tag: string;
  lines: Line[];
  /** Where the "Q12" heading was found. */
  page: number;
  y: number;
}

interface Marker {
  letter: OptionLetter;
  x: number;
  y: number;
  page: number;
}

/** Splits a question's lines into the question text, the four options and any inline answer. */
function readBlock(block: Block): DraftQuestion {
  const flags: string[] = [];
  const options: Record<OptionLetter, string> = { A: "", B: "", C: "", D: "" };

  // The first line with an "(A)" marker is where the options start.
  let optionStart = block.lines.findIndex((l) => l.cells.some((c) => isOptionMarker(c) === "A" || (OPTION_INLINE.exec(c.str.trim())?.[1].toUpperCase() === "A" && c.x === l.cells[0].x)));
  if (optionStart < 0) optionStart = block.lines.findIndex((l) => /^\(?[Aa][).]\s/.test(l.text));

  // An inline answer or explanation ends the options.
  const tailStart = block.lines.findIndex((l, i) => i > Math.max(optionStart, 0) && (INLINE_ANSWER.test(l.text) || INLINE_EXPLANATION.test(l.text)));
  const bodyEnd = tailStart < 0 ? block.lines.length : tailStart;
  const textLines = (optionStart < 0 ? block.lines.slice(0, bodyEnd) : block.lines.slice(0, optionStart)).map((l) => l.text);
  const optionLines = optionStart < 0 ? [] : block.lines.slice(optionStart, bodyEnd);

  // Where each option letter starts. A marker may be its own piece of text "(B)" or the start of one "(B) text".
  // Inline markers only count when they follow the letter before them, so "A. something" inside an option is left alone.
  const markers: Marker[] = [];
  const markerCells = new Set<Cell>();
  let lastCode = "A".charCodeAt(0) - 1;
  for (const line of optionLines) {
    for (const cell of line.cells) {
      const letter = isOptionMarker(cell);
      const inline = letter ? null : OPTION_INLINE.exec(cell.str.trim());
      const found = letter ?? (inline ? (inline[1].toUpperCase() as OptionLetter) : null);
      if (!found || found.charCodeAt(0) !== lastCode + 1) continue;
      lastCode = found.charCodeAt(0);
      markers.push({ letter: found, x: cell.x, y: line.y, page: line.page });
      markerCells.add(cell);
    }
  }
  const parts: Record<OptionLetter, string[]> = { A: [], B: [], C: [], D: [] };
  for (const line of optionLines) {
    for (const cell of line.cells) {
      let str = cell.str;
      if (isOptionMarker(cell) && markerCells.has(cell)) continue;
      if (markerCells.has(cell)) str = OPTION_INLINE.exec(cell.str.trim())?.[2] ?? "";
      if (!str.trim()) continue;
      const above = markers.filter((m) => m.page === line.page && m.y <= line.y + 1 && m.x <= cell.x + 3);
      if (above.length === 0) continue;
      const row = Math.max(...above.map((m) => m.y));
      const inRow = above.filter((m) => Math.abs(m.y - row) <= 3);
      const marker = inRow.reduce((a, b) => (b.x > a.x ? b : a));
      parts[marker.letter].push(str);
    }
  }
  for (const letter of OPTION_LETTERS) options[letter] = tidy(clean(parts[letter].join(" ")));

  // Answer and explanation written under the question.
  let correct: OptionLetter | null = null;
  const explanation: string[] = [];
  if (tailStart >= 0) {
    let inExplanation = false;
    for (const line of block.lines.slice(tailStart)) {
      const a = INLINE_ANSWER.exec(line.text);
      const e = INLINE_EXPLANATION.exec(line.text);
      if (a) {
        correct = a[1].toUpperCase() as OptionLetter;
        if (a[2]) explanation.push(INLINE_EXPLANATION.exec(a[2])?.[1] ?? a[2]);
        inExplanation = true;
      } else if (e) {
        explanation.push(e[1]);
        inExplanation = true;
      } else if (inExplanation) {
        explanation.push(line.text);
      }
    }
  }

  const text = tidy(joinWrapped(textLines));
  const missing = OPTION_LETTERS.filter((l) => !options[l]);
  if (!text) flags.push("The question text was not found.");
  if (missing.length === 4) flags.push("No options were found.");
  else if (missing.length > 0) flags.push(`Option ${missing.join(", ")} was not found.`);
  if (PICTURE_HINT.test(text)) flags.push("This question may refer to a picture or diagram that the reader cannot copy.");

  return { number: block.number, tag: block.tag, text, options, correct, explanation: clean(explanation.join(" ")), flags, spans: [] };
}

/** A type label printed beside the number: short, no sentence punctuation. */
function asTag(rest: string, hasMoreLines: boolean): string {
  const words = rest.split(/\s+/).filter(Boolean);
  if (!rest || !hasMoreLines) return "";
  if (words.length > 5 || /[?:.;]|\d/.test(rest.replace(/-/g, ""))) return "";
  return rest;
}

function splitBlocks(lines: Line[]): Block[] {
  const blocks: Block[] = [];
  const qStyle = lines.some((l) => Q_HEADER.test(l.text));
  let current: Block | null = null;
  let seenOptions = true; // the first question may start straight away
  let last = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const q = qStyle ? Q_HEADER.exec(line.text) : null;
    const n = !qStyle ? NUM_HEADER.exec(line.text) : null;
    // Numbered statements ("1. They lack...") look like new questions. A question can only start after the
    // previous one has shown its options, and numbers must go up in order.
    const startsQuestion = q ? true : n ? seenOptions && Number(n[1]) === last + 1 : false;
    if (startsQuestion) {
      const number = Number((q ?? n)?.[1]);
      const rest = (q ? q[2] : "") ?? "";
      const tag = q ? asTag(rest, i + 1 < lines.length) : "";
      current = { number, tag, lines: [], page: line.page, y: line.y };
      blocks.push(current);
      seenOptions = false;
      last = number;
      const firstText = q ? (tag ? "" : rest) : (n?.[2] ?? "");
      if (firstText) current.lines.push({ ...line, cells: line.cells, text: firstText });
      continue;
    }
    if (!current) continue;
    if (line.cells.some((c) => isOptionMarker(c) === "D") || /\(D\)/.test(line.text) || /^\(?[Dd][).]\s/.test(line.text)) seenOptions = true;
    current.lines.push(line);
  }
  return blocks;
}

// ---------------------------------------------------------------------------------------------
// The answer key
// ---------------------------------------------------------------------------------------------

interface KeyEntry {
  number: number;
  correct: OptionLetter;
  explanation: string;
}

/** Reads a key laid out as a table: question number, answer, explanation. */
function readKeyTable(lines: Line[]): KeyEntry[] {
  const header = lines.find((l) => l.cells.some((c) => /^ans/i.test(c.str.trim())) && l.cells.some((c) => /expl|solution|reason/i.test(c.str.trim())));
  if (!header) return [];
  const ansX = header.cells.find((c) => /^ans/i.test(c.str.trim()))?.x ?? 0;
  const explX = header.cells.find((c) => /expl|solution|reason/i.test(c.str.trim()))?.x ?? 0;
  const after = lines.slice(lines.indexOf(header) + 1);

  interface Row {
    number: number;
    correct: OptionLetter;
    page: number;
    y: number;
  }
  const rows: Row[] = [];
  for (const line of after) {
    // The number is everything left of the Answer column, the answer is one letter in it.
    const left = line.cells.filter((c) => c.x < ansX - 4).map((c) => c.str).join("");
    const num = /^Q?\.?\s*(\d{1,4})\s*$/i.exec(clean(left));
    const letter = line.cells.find((c) => c.x >= ansX - 6 && c.x < explX - 6 && /^[A-Da-d]$/.test(c.str.trim()));
    if (num && letter) rows.push({ number: Number(num[1]), correct: letter.str.trim().toUpperCase() as OptionLetter, page: line.page, y: line.y });
  }
  if (rows.length === 0) return [];

  // Explanation text sits to the right of its row and runs below it. A line belongs to the last row that starts
  // at or above it (a little above, for a number written over a fraction bar). Lines at the top of a page
  // carry on from the last row of an earlier page.
  const explanation = new Map<Row, { page: number; y: number; text: string }[]>();
  for (const line of after) {
    // The table heading is repeated at the top of every page. It is not an explanation.
    if (line.cells.some((c) => /^ans/i.test(c.str.trim()) && c.x < explX - 6) && line.cells.some((c) => /expl|solution|reason/i.test(c.str.trim()))) continue;
    const cells = line.cells.filter((c) => c.x >= explX - 3);
    if (cells.length === 0) continue;
    const owner = [...rows].reverse().find((r) => r.page < line.page || (r.page === line.page && r.y <= line.y + 8));
    if (!owner) continue;
    const list = explanation.get(owner) ?? [];
    list.push({ page: line.page, y: line.y, text: cells.map((c) => c.str).join(" ") });
    explanation.set(owner, list);
  }
  return rows.map((r) => ({
    number: r.number,
    correct: r.correct,
    explanation: tidy(clean((explanation.get(r)?.sort((a, b) => a.page - b.page || a.y - b.y).map((p) => p.text) ?? []).join(" "))),
  }));
}

/** Reads a plain list of answers: "1. B  2. C  3. A" or "1-B, 2-C". */
function readKeyList(lines: Line[]): KeyEntry[] {
  const text = lines.map((l) => l.text).join(" ");
  const out: KeyEntry[] = [];
  const seen = new Set<number>();
  for (const m of text.matchAll(/(?:^|[\s,;])Q?\.?\s*(\d{1,4})\s*[.):\-–]?\s*\(?([A-Da-d])\)?(?=[\s,;.]|$)/g)) {
    const number = Number(m[1]);
    if (seen.has(number)) continue;
    seen.add(number);
    out.push({ number, correct: m[2].toUpperCase() as OptionLetter, explanation: "" });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// The whole file
// ---------------------------------------------------------------------------------------------

export function parseQuestionPdf(rawItems: TextItem[]): ParseResult {
  const warnings: string[] = [];
  const items = dropPageFurniture(rawItems);
  const lines = buildLines(items);

  // The key starts at a heading like "Answer Key" that is not itself a question.
  const keyAt = lines.findIndex((l) => KEY_HEADING.test(l.text) && !Q_HEADER.test(l.text) && !INLINE_ANSWER.test(l.text) && !/:/.test(l.text) && l.text.length < 80);
  const questionLines = keyAt < 0 ? lines : lines.slice(0, keyAt);
  const keyLines = keyAt < 0 ? [] : lines.slice(keyAt + 1);

  const blocks = splitBlocks(questionLines);
  const questions = blocks.map(readBlock);
  const heights = new Map(rawItems.map((i) => [i.page, i.pageHeight]));
  blocks.forEach((b, i) => {
    questions[i].spans = blockSpans(b, blocks[i + 1], heights);
  });

  let key = keyLines.length ? readKeyTable(keyLines) : [];
  if (keyLines.length && key.length === 0) key = readKeyList(keyLines);
  const byNumber = new Map(key.map((k) => [k.number, k]));
  let fromKey = 0;
  for (const q of questions) {
    q.text = joinBrokenFormulas(q.text);
    for (const letter of OPTION_LETTERS) q.options[letter] = joinBrokenFormulas(q.options[letter]);
    const k = byNumber.get(q.number);
    if (k) {
      fromKey += 1;
      q.correct = q.correct ?? k.correct;
      if (!q.explanation) q.explanation = k.explanation;
    }
    if (!q.correct) q.flags.push("No answer was found for this question.");
    else if (q.options[q.correct] === "" && q.options.A + q.options.B + q.options.C + q.options.D !== "") {
      q.flags.push(`The answer is ${q.correct}, but option ${q.correct} was not found.`);
    }
    if (!q.explanation) q.flags.push("No explanation was found.");
    q.explanation = joinBrokenFormulas(q.explanation);
    q.flags.push(...mathFlags(q));
  }

  // Checks on the file as a whole.
  if (questions.length === 0) {
    warnings.push("No questions were found. The PDF may be scanned pictures, or laid out in a way the reader does not know yet.");
    return { questions, warnings };
  }
  const printed = /\b(\d{1,4})\s+(?:practice\s+|nda\s+|cds\s+|afcat\s+)?(?:mcqs?|questions)\b/i.exec(lines.slice(0, 14).map((l) => l.text).join(" "));
  if (printed && Number(printed[1]) !== questions.length) {
    warnings.push(`The first page says ${printed[1]} questions, but ${questions.length} were found.`);
  }
  const numbers = questions.map((q) => q.number);
  const gaps: number[] = [];
  for (let n = numbers[0]; n <= numbers[numbers.length - 1]; n += 1) if (!numbers.includes(n)) gaps.push(n);
  if (gaps.length > 0) warnings.push(`Question number${gaps.length > 1 ? "s" : ""} ${gaps.slice(0, 8).join(", ")} ${gaps.length > 1 ? "are" : "is"} missing from the list.`);
  if (keyLines.length > 0 && key.length === 0) warnings.push("An answer key was found, but its rows could not be read.");
  if (keyLines.length === 0 && questions.every((q) => !q.correct)) warnings.push("No answer key was found. Set the correct option of each question in the preview.");
  if (key.length > 0 && fromKey < questions.length) warnings.push(`The answer key matched ${fromKey} of ${questions.length} questions.`);
  return { questions, warnings };
}

/** Room kept above a heading and below the last line, for fraction bars and tall brackets. */
const SPAN_ABOVE = 12;
const SPAN_BELOW = 16;

/** The strips of the pages a question covers: from its heading to the next question, or to its last line. */
function blockSpans(block: Block, next: Block | undefined, heights: Map<number, number>): PageSpan[] {
  const rows = [{ page: block.page, y: block.y }, ...block.lines.map((l) => ({ page: l.page, y: l.y }))];
  const pages = [...new Set(rows.map((r) => r.page))].sort((a, b) => a - b);
  const spans: PageSpan[] = [];
  for (const page of pages) {
    const height = heights.get(page);
    if (!height) continue;
    const ys = rows.filter((r) => r.page === page).map((r) => r.y);
    const top = page === block.page ? block.y - SPAN_ABOVE : Math.min(...ys) - SPAN_ABOVE;
    const bottom = next && next.page === page ? next.y - SPAN_ABOVE - 2 : Math.max(...ys) + SPAN_BELOW;
    const t = Math.max(0, top) / height;
    const b = Math.min(height, Math.max(bottom, top + 20)) / height;
    spans.push({ page, top: Math.round(t * 10000) / 10000, bottom: Math.round(b * 10000) / 10000 });
  }
  return spans;
}

/** True when a draft is complete enough to save as a question: text, four options, and an answer. */
export function isCompleteDraft(q: Pick<DraftQuestion, "text" | "options" | "correct">): boolean {
  return Boolean(q.text.trim()) && OPTION_LETTERS.every((l) => q.options[l].trim()) && q.correct !== null;
}
