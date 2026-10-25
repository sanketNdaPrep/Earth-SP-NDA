'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders question text that mixes plain words and LaTeX.
 *   $x^2 + 1$          inline
 *   $$\int_0^1 x\,dx$$  display
 *   \( ... \)  \[ ... \]   also accepted
 *   \$                 a literal dollar sign
 * Plain Unicode maths (x², √, θ) passes straight through, so seeded content in either style works.
 * A dollar sign only opens maths when it hugs the formula ("$5 and $10" stays as prices).
 * A formula KaTeX cannot parse is shown as typed instead of breaking the page.
 */

export type MathSegment =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string; display: boolean; raw: string };

export function parseMath(input: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let buffer = '';
  let i = 0;

  const flush = () => {
    if (buffer) segments.push({ type: 'text', value: buffer });
    buffer = '';
  };
  const pushMath = (value: string, display: boolean, raw: string) => {
    flush();
    segments.push({ type: 'math', value: value.trim(), display, raw });
  };

  const isSpace = (char: string | undefined) => char === undefined || /\s/.test(char);
  const isDigit = (char: string | undefined) => char !== undefined && /[0-9]/.test(char);

  while (i < input.length) {
    const char = input[i];

    // \$ is a literal dollar sign.
    if (char === '\\' && input[i + 1] === '$') {
      buffer += '$';
      i += 2;
      continue;
    }

    // \( ... \) and \[ ... \]
    if (char === '\\' && (input[i + 1] === '(' || input[i + 1] === '[')) {
      const display = input[i + 1] === '[';
      const close = display ? '\\]' : '\\)';
      const end = input.indexOf(close, i + 2);
      if (end !== -1) {
        pushMath(input.slice(i + 2, end), display, input.slice(i, end + 2));
        i = end + 2;
        continue;
      }
    }

    if (char === '$') {
      // $$ ... $$
      if (input[i + 1] === '$') {
        const end = input.indexOf('$$', i + 2);
        if (end !== -1 && input.slice(i + 2, end).trim()) {
          pushMath(input.slice(i + 2, end), true, input.slice(i, end + 2));
          i = end + 2;
          continue;
        }
      } else if (!isSpace(input[i + 1])) {
        // $ ... $ : the closing $ must hug the formula and must not be followed by a digit.
        let j = i + 1;
        let found = -1;
        while (j < input.length) {
          const next = input.indexOf('$', j);
          if (next === -1) break;
          const before = input[next - 1];
          if (before !== '\\' && !isSpace(before) && !isDigit(input[next + 1])) {
            found = next;
            break;
          }
          j = next + 1;
        }
        if (found !== -1) {
          pushMath(input.slice(i + 1, found), false, input.slice(i, found + 1));
          i = found + 1;
          continue;
        }
      }
    }

    buffer += char;
    i += 1;
  }

  flush();
  return segments;
}

function renderTex(tex: string, display: boolean): string | null {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      strict: 'ignore',
      trust: false,
      output: 'htmlAndMathml',
    });
  } catch {
    return null;
  }
}

export function MathText({ text, className = '' }: { text: string; className?: string }) {
  const nodes = useMemo(
    () =>
      parseMath(text).map((segment, index) => {
        if (segment.type === 'text') return <span key={index}>{segment.value}</span>;
        const html = renderTex(segment.value, segment.display);
        if (html === null) {
          return (
            <code key={index} className="rounded bg-navy-800 px-1 py-0.5 font-mono text-[0.9em] text-gold-300">
              {segment.raw}
            </code>
          );
        }
        return segment.display ? (
          <span
            key={index}
            className="my-2 block max-w-full overflow-x-auto overflow-y-hidden"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
        );
      }),
    [text],
  );

  return <span className={`whitespace-pre-line [overflow-wrap:anywhere] ${className}`}>{nodes}</span>;
}