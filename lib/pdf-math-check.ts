import katex from "katex";

/** Symbols that only mean something inside LaTeX. Seen outside it, the reader missed the equation. */
const LOOSE = /[∑∏∫∮√⃗ˆ˜¯˙¨ˇ]|[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;

/** The pieces of text that sit between dollar signs. */
function formulas(text: string): { tex: string; display: boolean }[] {
  const out: { tex: string; display: boolean }[] = [];
  for (const m of text.matchAll(/\$\$([^$]+)\$\$|\$([^$]+)\$/g)) out.push({ tex: (m[1] ?? m[2]).trim(), display: m[1] !== undefined });
  return out;
}

function outside(text: string): string {
  return text.replace(/\$\$[^$]+\$\$|\$[^$]+\$/g, " ");
}

/** A formula whose round brackets do not pair up was cut in the wrong place. */
function bracketsBroken(tex: string): boolean {
  const plain = tex.replace(/\\(?:left|right|big|Big|bigg|Bigg)(?![a-zA-Z])/g, "").replace(/\\[()]/g, "");
  let depth = 0;
  for (const ch of plain) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    if (depth < 0) return true;
  }
  return depth !== 0;
}

/** What is wrong with the maths in one piece of text, in plain words. Empty when it looks fine. */
export function mathProblems(text: string, label: string): string[] {
  if (!text) return [];
  const problems: string[] = [];
  if (formulas(text).some((f) => bracketsBroken(f.tex))) problems.push(`${label}: an equation looks cut in the wrong place.`);
  const dollars = text.replace(/\\\$/g, "").split("$").length - 1;
  if (dollars % 2 === 1) problems.push(`${label}: an equation was not closed properly.`);
  for (const f of formulas(text)) {
    try {
      katex.renderToString(f.tex, { displayMode: f.display, throwOnError: true, strict: "ignore", trust: false });
    } catch {
      problems.push(`${label}: an equation could not be drawn.`);
      break;
    }
  }
  if (LOOSE.test(outside(text))) problems.push(`${label}: some maths symbols were left as plain text.`);
  return problems;
}

/** One line to show the admin for a question, or none. Compares nothing with the picture: that is the admin's job. */
export function mathFlags(q: { text: string; options: Record<string, string>; explanation: string }): string[] {
  const found = [
    ...mathProblems(q.text, "Question"),
    ...Object.entries(q.options).flatMap(([letter, value]) => mathProblems(value, `Option ${letter}`)),
    ...mathProblems(q.explanation, "Explanation"),
  ];
  if (formulas(q.explanation).some((f) => /\\text\{[^}]*[a-z]{2}[^}]*\}/.test(f.tex))) found.push("Explanation: words got mixed into an equation.");
  const filled = Object.entries(q.options).filter(([, v]) => v.trim());
  const same = filled.find(([letter, v], i) => filled.findIndex(([, w]) => w.replace(/\s+/g, "") === v.replace(/\s+/g, "")) !== i && letter);
  if (same) found.push("Two options came out the same. A sign such as | | or a bracket may have been missed.");
  if (found.length === 0) return [];
  return [...found, "Check this maths against the original picture."];
}

const GREEK: Record<string, string> = {
  α: "\\alpha ", β: "\\beta ", γ: "\\gamma ", δ: "\\delta ", ε: "\\epsilon ", θ: "\\theta ", λ: "\\lambda ", μ: "\\mu ",
  π: "\\pi ", σ: "\\sigma ", φ: "\\phi ", ω: "\\omega ", ϕ: "\\phi ", Δ: "\\Delta ", Σ: "\\Sigma ", Ω: "\\Omega ",
};

/** Plain text that can sit inside an equation: signs, digits, single letters, Greek letters. Null when it is a real word. */
function asTex(gap: string): string | null {
  if (/[A-Za-z]{3,}/.test(gap) || gap.length > 24) return null;
  let out = "";
  for (const ch of gap) {
    if (GREEK[ch]) out += GREEK[ch];
    else if (ch === "−") out += "-";
    else if (ch === "·") out += "\\cdot ";
    else if (ch === "×") out += "\\times ";
    else if (/[\s\w,.+\-=()/|<>]/.test(ch)) out += ch;
    else return null;
  }
  return out;
}

function open(tex: string): number {
  const plain = tex.replace(/\\(?:left|right|big|Big|bigg|Bigg)(?![a-zA-Z])/g, "").replace(/\\[()]/g, "");
  return (plain.match(/\(/g)?.length ?? 0) - (plain.match(/\)/g)?.length ?? 0);
}

/**
 * The PDF sometimes breaks one equation around a Greek letter or a minus sign: "$(a\cos$ α, a $\sin$ α)".
 * An equation that opens a bracket and does not close it is joined to what follows until the bracket closes.
 */
export function joinBrokenFormulas(text: string): string {
  if (!text.includes("$")) return text;
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/);
  const out: string[] = [];
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    const isMath = part.startsWith("$") && !part.startsWith("$$") && part.length > 2;
    if (!isMath || open(part.slice(1, -1)) <= 0) {
      out.push(part);
      continue;
    }
    let tex = part.slice(1, -1);
    let j = i + 1;
    let rest = "";
    let ok = false;
    while (j < parts.length && !ok) {
      const gap = parts[j];
      // Take plain text up to the bracket that closes the equation, or all of it if the equation stays open.
      let take = gap.length;
      for (let k = 0; k < gap.length; k += 1) {
        if (gap[k] === ")" && open(tex + (asTex(gap.slice(0, k + 1)) ?? "")) <= 0 && asTex(gap.slice(0, k + 1)) !== null) {
          take = k + 1;
          break;
        }
      }
      const g = asTex(gap.slice(0, take));
      if (g === null) break;
      tex += g;
      rest = gap.slice(take);
      j += 1;
      if (open(tex) <= 0) {
        ok = true;
        break;
      }
      const next = parts[j];
      if (next === undefined || !next.startsWith("$") || next.startsWith("$$")) break;
      tex += next.slice(1, -1) + " ";
      j += 1;
      if (open(tex) <= 0) {
        ok = true;
        rest = "";
      }
    }
    if (ok) {
      out.push(`$${tex.replace(/\s+/g, " ").trim()}$${rest}`);
      i = j - 1;
    } else out.push(part);
  }
  return out.join("");
}
