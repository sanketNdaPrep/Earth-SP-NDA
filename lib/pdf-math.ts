/**
 * Turns the pieces of a maths PDF back into LaTeX.
 *
 * A PDF made with LaTeX stores a fraction as a small number over another small number with a drawn line between,
 * a power as a smaller number raised up, and a square root as a sign with a line over the number. Reading the
 * text line by line flattens all of that ("3/5" arrives as "53"). This file reads the positions and sizes instead
 * and writes the formula as LaTeX: \frac{3}{5}, x^{2}, \sqrt{3}. Everything else is left exactly as it was.
 *
 * Pure functions only, so it runs in tests and in the browser.
 */
import type { TextItem } from "./pdf-questions";

/** A horizontal line drawn on a page (a fraction bar or the top of a square root). y counts down from the top. */
export interface Rule {
  page: number;
  x0: number;
  x1: number;
  y: number;
}

interface G {
  x: number;
  w: number;
  y: number;
  size: number;
  str: string;
  /** Ready-made LaTeX for pieces this file built itself (a fraction, a root). */
  latex?: string;
  dead?: boolean;
  /** The original item, kept so text that needs no change is passed on untouched. */
  orig?: TextItem;
  /** Sits next to the following letter as an accent: a hat over i, j, k. */
  hatNext?: boolean;
  big?: boolean;
}

interface Tok {
  g: G;
  sup: G[];
  sub: G[];
  /** Small pieces printed before the letter, like the n of nPr. */
  pre?: G[];
}

type Kind = "E" | "N" | "T";

// ---------------------------------------------------------------------------------------------
// Symbols
// ---------------------------------------------------------------------------------------------

const FUNCS = ["sin", "cos", "tan", "cot", "sec", "cosec", "csc", "log", "ln", "lim", "exp", "max", "min", "det", "sinh", "cosh", "tanh", "arg", "gcd", "mod"];
const FUNC_SET = new Set(FUNCS);
const FUNC_TAIL = new RegExp(`(?:^|[^A-Za-z])(${FUNCS.join("|")})\\s*$`);
const SHORT_WORDS = new Set(["and", "the", "for", "are", "not", "but", "any", "all", "has", "its", "who", "how", "why", "one", "two", "is", "if", "or", "of", "to", "in", "on", "at", "by", "an", "as", "be", "no", "so", "we", "it"]);

const SYM: Record<string, string> = {
  "−": "-", "–": "-", "×": "\\times ", "÷": "\\div ", "±": "\\pm ", "∓": "\\mp ", "≤": "\\le ", "≥": "\\ge ", "≠": "\\ne ", "≈": "\\approx ",
  "≡": "\\equiv ", "∼": "\\sim ", "≅": "\\cong ", "→": "\\to ", "←": "\\leftarrow ", "↔": "\\leftrightarrow ", "⇒": "\\Rightarrow ", "⟹": "\\Longrightarrow ",
  "⇔": "\\Leftrightarrow ", "⟺": "\\Longleftrightarrow ", "⇐": "\\Leftarrow ", "∈": "\\in ", "∉": "\\notin ", "∋": "\\ni ", "⊂": "\\subset ", "⊃": "\\supset ",
  "⊆": "\\subseteq ", "⊇": "\\supseteq ", "∪": "\\cup ", "∩": "\\cap ", "∅": "\\emptyset ", "∞": "\\infty ", "∂": "\\partial ", "∇": "\\nabla ",
  "∑": "\\sum ", "∏": "\\prod ", "∫": "\\int ", "∮": "\\oint ", "√": "\\sqrt{}", "·": "\\cdot ", "⋅": "\\cdot ", "∘": "\\circ ", "◦": "\\circ ",
  "°": "^{\\circ}", "′": "'", "″": "''", "∠": "\\angle ", "△": "\\triangle ", "∥": "\\parallel ", "⊥": "\\perp ", "∴": "\\therefore ", "∵": "\\because ",
  "∀": "\\forall ", "∃": "\\exists ", "¬": "\\neg ", "∧": "\\wedge ", "∨": "\\vee ", "…": "\\ldots ", "⋯": "\\cdots ", "ℝ": "\\mathbb{R}", "ℕ": "\\mathbb{N}",
  "ℤ": "\\mathbb{Z}", "ℚ": "\\mathbb{Q}", "ℂ": "\\mathbb{C}", "ı": "\\imath ", "ȷ": "\\jmath ", "{": "\\{", "}": "\\}", "%": "\\%", "&": "\\&", "#": "\\#",
  "_": "\\_", "$": "\\$", "⌊": "\\lfloor ", "⌋": "\\rfloor ", "⌈": "\\lceil ", "⌉": "\\rceil ", "⟨": "\\langle ", "⟩": "\\rangle ", "‖": "\\| ",
  "²": "^{2}", "³": "^{3}", "¹": "^{1}", "½": "\\frac{1}{2}", "¼": "\\frac{1}{4}", "¾": "\\frac{3}{4}", "ℓ": "\\ell ", "ℏ": "\\hbar ", "′′": "''",
};
const GREEK: Record<string, string> = {
  α: "alpha", β: "beta", γ: "gamma", δ: "delta", ε: "epsilon", ϵ: "epsilon", ζ: "zeta", η: "eta", θ: "theta", ϑ: "vartheta", ι: "iota", κ: "kappa",
  λ: "lambda", μ: "mu", ν: "nu", ξ: "xi", π: "pi", ρ: "rho", σ: "sigma", τ: "tau", υ: "upsilon", φ: "phi", ϕ: "varphi", χ: "chi", ψ: "psi", ω: "omega",
  Γ: "Gamma", Δ: "Delta", Θ: "Theta", Λ: "Lambda", Ξ: "Xi", Π: "Pi", Σ: "Sigma", Φ: "Phi", Ψ: "Psi", Ω: "Omega",
};

/** Tall brackets and operators come out of the LaTeX extension font as control characters. L and R mark a left and a right bracket. */
const TALL: Record<number, string> = {
  0: "L(", 1: "R)", 2: "L[", 3: "R]", 4: "L\\lfloor ", 5: "R\\rfloor ", 6: "L\\lceil ", 7: "R\\rceil ", 8: "L\\{", 9: "R\\}", 10: "L\\langle ", 11: "R\\rangle ",
  12: "|", 13: "\\| ", 16: "L(", 17: "R)", 18: "L(", 19: "R)", 20: "L[", 21: "R]", 22: "L\\lfloor ", 23: "R\\rfloor ", 24: "L\\lceil ", 25: "R\\rceil ",
  26: "L\\{", 27: "R\\}", 28: "L\\langle ", 29: "R\\rangle ",
};
const ACCENT: Record<string, string> = { "⃗": "\\vec", "ˆ": "\\hat", "˜": "\\tilde", "¯": "\\bar", "˙": "\\dot", "¨": "\\ddot", "ˇ": "\\check" };
// Symbols that need LaTeX to show properly. Plain signs like − × ≤ ≠ π show fine as they are.
const MATH_CHAR = /[∑∏∫∮√\u20d7ˆ˜¯˙¨ˇ]/;
const hasControl = (s: string) => /[\u0000-\u0008\u000e-\u001f]/.test(s);

const isLetter = (c: string) => /^[A-Za-zıȷ]$/.test(c);

/** One piece of text as LaTeX in maths mode. */
function mapString(str: string, hat: { on: boolean }): string {
  let out = "";
  const cmex = hasControl(str);
  const chars = [...str];
  for (let i = 0; i < chars.length; i += 1) {
    const c = chars[i];
    const code = c.codePointAt(0) ?? 0;
    if (code < 32 && code !== 9 && code !== 10) {
      const t = TALL[code];
      out += t ?? "\\text{?}";
      continue;
    }
    if (c === "ˆ" || c === "^") {
      // A hat that was printed before its letter.
      if (c === "ˆ") {
        hat.on = true;
        continue;
      }
    }
    if (cmex && (c === "R" || c === "P" || c === "Q")) {
      out += c === "R" ? "\\int " : c === "P" ? "\\sum " : "\\prod ";
      continue;
    }
    if (/[A-Za-z]/.test(c)) {
      let j = i;
      while (j < chars.length && /[A-Za-z]/.test(chars[j])) j += 1;
      const word = chars.slice(i, j).join("");
      if (FUNC_SET.has(word)) {
        out += word === "cosec" ? "\\operatorname{cosec} " : `\\${word} `;
        i = j - 1;
        continue;
      }
      if (word.length >= 4 || (word.length === 3 && SHORT_WORDS.has(word)) || (word.length === 2 && SHORT_WORDS.has(word))) {
        out += `\\text{${word}} `;
        i = j - 1;
        continue;
      }
      // Single letters of a word that is not a function: plain variables.
      for (const ch of word) {
        out += hat.on ? `\\hat{${ch === "i" ? "\\imath " : ch === "j" ? "\\jmath " : ch}}` : ch;
        hat.on = false;
      }
      i = j - 1;
      continue;
    }
    if (c === " ") continue;
    if (GREEK[c]) {
      out += `\\${GREEK[c]} `;
      continue;
    }
    if (SYM[c] !== undefined) {
      out += SYM[c];
      continue;
    }
    out += c;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Rebuilding structure
// ---------------------------------------------------------------------------------------------

const GAP_BEFORE = -2.4;
const GAP_AFTER = 3.6;
const RUN_GAP = 6;
const AXIS = 0.25;

function endOf(g: G): number {
  return g.x + g.w;
}
function tokEnd(t: Tok): number {
  return Math.max(endOf(t.g), ...t.sup.map(endOf), ...t.sub.map(endOf));
}
function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
}

/** Direction of a small piece relative to the letter it follows. */
function direction(dy: number): "up" | "down" | "flat" {
  if (dy < -1.4) return "up";
  if (dy > 0.9) return "down";
  return "flat";
}

function copy(g: G, patch: Partial<G>): G {
  return { ...g, orig: undefined, ...patch };
}

/** Splits the end of a text piece off, so a power can sit on just the last character. */
function splitTail(g: G): [G | null, G] {
  const text = g.str.replace(/\s+$/, "");
  if (text.length <= 1 || g.latex) return [null, g];
  let m = /(\d+(?:\.\d+)?)$/.exec(text);
  if (!m) {
    const word = /([A-Za-z]+)$/.exec(text);
    if (word) {
      const w = word[1];
      m = FUNC_SET.has(w) ? word : /^[A-Z]{2,3}$/.test(w) ? word : ([w.slice(-1), w.slice(-1)] as unknown as RegExpExecArray);
    }
  }
  const tail = m ? m[1] : text.slice(-1);
  if (tail.length >= text.length) return [null, g];
  const total = g.str.length || 1;
  const tailW = (g.w * tail.length) / total;
  const prefixStr = text.slice(0, text.length - tail.length);
  const prefix = copy(g, { str: prefixStr, w: (g.w * prefixStr.length) / total });
  const rest = copy(g, { str: tail, x: endOf(g) - tailW, w: tailW });
  return [prefix, rest];
}

function isOptionMarker(str: string): boolean {
  return /^\(?[A-Da-d][).](?:\s|$)/.test(str.trim());
}

function evidence(t: Tok): boolean {
  const g = t.g;
  if (t.sup.length || t.sub.length || g.latex || g.hatNext || g.big) return true;
  const s = g.str.trim();
  if (FUNC_SET.has(s)) return true;
  return MATH_CHAR.test(g.str) || hasControl(g.str);
}

function kindOf(t: Tok): Kind {
  if (evidence(t)) return "E";
  const s = t.g.str.trim();
  if (isOptionMarker(s)) return "T";
  if (/^[\s\d().,;:+\-=<>|[\]{}/!?*'’"%]*$/.test(t.g.str)) return "N";
  if (s.length === 1 && isLetter(s)) return "N";
  return "T";
}

/** All pieces of a group turned into LaTeX in maths mode. Scripts are read recursively. */
function renderGroup(items: G[]): string {
  const toks = buildTokens(items, Math.max(...items.map((g) => g.size), 1));
  return tokensToLatex(toks.sort((a, b) => a.g.x - b.g.x));
}

function tokenLatex(t: Tok, hat: { on: boolean }): string {
  let base = t.g.latex ?? mapString(t.g.str, hat);
  if (t.pre?.length) base = `{}^{${renderGroup(t.pre)}}${base}`;
  if (t.g.hatNext) hat.on = true;
  if (t.sub.length) base += `_{${renderGroup(t.sub)}}`;
  if (t.sup.length) base += `^{${renderGroup(t.sup)}}`;
  return base;
}

function tokensToLatex(toks: Tok[]): string {
  const hat = { on: false };
  let out = toks.map((t) => tokenLatex(t, hat)).join("");
  // Tall brackets need a partner. When they do not pair up, use plain ones.
  const left = (out.match(/\bL(?=[(\[\\|])/g) ?? []).length;
  out = out.replace(/(^|[^\\A-Za-z])L(?=\(|\[|\\\{|\\lfloor|\\lceil|\\langle)/g, "$1\\left").replace(/(^|[^\\A-Za-z])R(?=\)|\]|\\\}|\\rfloor|\\rceil|\\rangle)/g, "$1\\right");
  void left;
  const lefts = (out.match(/\\left/g) ?? []).length;
  const rights = (out.match(/\\right/g) ?? []).length;
  if (lefts !== rights) out = out.replace(/\\left|\\right/g, "");
  return out.replace(/\s+/g, " ").replace(/\{\s+/g, "{").replace(/\s+\}/g, "}").trim();
}

/** Accents (a vector arrow, a hat) sit over the letter they belong to. */
function attachAccents(pool: G[]): G[] {
  const out = [...pool];
  for (const acc of pool) {
    const ch = acc.str.trim();
    if (acc.dead || ch.length !== 1 || !ACCENT[ch]) continue;
    const letters = out.filter((g) => g !== acc && !g.dead && g.size >= acc.size * 0.8 && Math.abs(g.y - acc.y) <= 7 && acc.x >= g.x - 3 && acc.x <= endOf(g) + 1.5 && /[A-Za-zıȷ]$/.test(g.str.trim()));
    if (letters.length === 0) continue;
    const base = letters.reduce((a, b) => (Math.abs(b.x + b.w / 2 - acc.x) < Math.abs(a.x + a.w / 2 - acc.x) ? b : a));
    const [prefix, tail] = splitTail(base);
    const letter = tail.str.trim().slice(-1);
    const shown = letter === "i" && ch === "ˆ" ? "\\imath " : letter === "j" && ch === "ˆ" ? "\\jmath " : letter;
    const merged = copy(tail, { str: letter, latex: `${ACCENT[ch]}{${shown}}` });
    out.splice(out.indexOf(base), 1, ...(prefix ? [prefix, merged] : [merged]));
    acc.dead = true;
  }
  return out.filter((g) => !g.dead);
}

/** Makes tall brackets and big operators sit on the baseline of the row they belong to. */
function snapBig(pool: G[]): void {
  for (const b of pool) {
    if (!b.big) continue;
    const near = pool.filter((g) => !g.big && !g.dead && g.size >= b.size * 0.85 && g.y >= b.y - 1.5 && g.y <= b.y + b.size * 1.5 && (Math.abs(g.x - endOf(b)) < 30 || Math.abs(endOf(g) - b.x) < 30));
    if (near.length === 0) continue;
    const closest = near.reduce((a, c) => (Math.min(Math.abs(c.x - endOf(b)), Math.abs(endOf(c) - b.x)) < Math.min(Math.abs(a.x - endOf(b)), Math.abs(endOf(a) - b.x)) ? c : a));
    b.y = closest.y;
  }
}

/** Groups pieces into letters with powers and subscripts attached. */
function buildTokens(input: G[], ref: number): Tok[] {
  let pool = attachAccents(input.filter((g) => !g.dead));
  snapBig(pool);
  // A lone R, P or Q with two small numbers beside it is an integral, a sum or a product sign.
  // The sign is drawn taller than the line, so the bounds are placed around it, and its baseline is set between them.
  pool = pool.map((g) => {
    const s = g.str.trim();
    if ((s === "R" || s === "P" || s === "Q") && !g.latex) {
      const bounds = pool.filter((o) => o !== g && o.size < g.size * 0.85 && o.x >= endOf(g) - 3.5 && o.x <= endOf(g) + 8 && Math.abs(o.y - g.y) < g.size * 1.7);
      const ys = [...new Set(bounds.map((o) => Math.round(o.y)))];
      if (ys.length >= 2 && Math.max(...ys) - Math.min(...ys) > 6) {
        const mid = (Math.max(...bounds.map((o) => o.y)) + Math.min(...bounds.map((o) => o.y))) / 2;
        return copy(g, { str: s === "R" ? "∫" : s === "P" ? "∑" : "∏", big: true, y: mid });
      }
    }
    return g;
  });
  const isBase = (g: G) => g.size >= ref * 0.88 || Boolean(g.latex) || g.big;
  const toks: Tok[] = pool.filter(isBase).sort((a, b) => a.x - b.x).map((g) => ({ g, sup: [], sub: [] }));
  const small = pool.filter((g) => !isBase(g)).sort((a, b) => a.x - b.x);
  const chains: { tok: Tok; dir: "up" | "down"; items: G[]; end: number }[] = [];
  const lonely: G[] = [];

  for (const s of small) {
    let placed = false;
    for (let i = chains.length - 1; i >= 0; i -= 1) {
      const c = chains[i];
      const gap = s.x - c.end;
      if (gap < GAP_BEFORE || gap > GAP_AFTER) continue;
      if (Math.abs(s.y - c.tok.g.y) > c.tok.g.size * 1.3 + 3) continue;
      // A smaller piece right after the chain is a script of the chain's last piece, wherever it sits vertically.
      const last = c.items[c.items.length - 1];
      if (direction(s.y - c.tok.g.y) !== c.dir && !(s.size < last.size * 0.9)) continue;
      c.items.push(s);
      c.end = Math.max(c.end, endOf(s));
      placed = true;
      break;
    }
    if (placed) continue;
    const cands = toks.filter((t) => {
      const gap = s.x - endOf(t.g);
      const dy = s.y - t.g.y;
      // Operators carry no scripts; tall brackets carry them higher up.
      return gap >= GAP_BEFORE && gap <= GAP_AFTER && dy >= (t.g.big ? -12 : -9) && dy <= (t.g.big ? 16 : 5) && (t.g.big || Boolean(t.g.latex) || /[A-Za-z0-9)\]}'|ıȷ]\s*$/.test(t.g.str));
    });
    if (cands.length === 0) {
      // A small piece right before a letter is a prefix script (the n of nPr).
      const after = toks.find((t) => t.g.x - endOf(s) >= -2.4 && t.g.x - endOf(s) <= 2.4 && direction(s.y - t.g.y) === "up" && Math.abs(s.y - t.g.y) <= t.g.size * 1.3 + 3);
      if (after) (after.pre ??= []).push(s);
      else lonely.push(s);
      continue;
    }
    const t = cands.reduce((a, b) => (Math.abs(s.x - endOf(b.g)) < Math.abs(s.x - endOf(a.g)) ? b : a));
    const dir = direction(s.y - t.g.y);
    if (dir === "flat") {
      lonely.push(s);
      continue;
    }
    // A power sits on the last character of a text piece.
    const [prefix, tail] = splitTail(t.g);
    if (prefix) {
      toks.push({ g: prefix, sup: [], sub: [] });
      t.g = tail;
    }
    const chain = chains.find((c) => c.tok === t && c.dir === dir && s.x - c.end >= GAP_BEFORE && s.x - c.end <= GAP_AFTER);
    if (chain) {
      chain.items.push(s);
      chain.end = Math.max(chain.end, endOf(s));
    } else chains.push({ tok: t, dir, items: [s], end: endOf(s) });
  }
  for (const c of chains) (c.dir === "up" ? c.tok.sup : c.tok.sub).push(...c.items);
  for (const s of lonely) toks.push({ g: s, sup: [], sub: [] });
  return toks;
}

// ---------------------------------------------------------------------------------------------
// Fractions and roots from the drawn lines
// ---------------------------------------------------------------------------------------------

/** A matrix: rows of numbers split by "&", between a tall left bracket and a tall right bracket. */
function applyMatrices(pool: G[]): void {
  const rowRe = /^[0-9A-Za-z.+\-−]*(?:&[0-9A-Za-z.+\-−]*)+$/;
  for (const left of pool.filter((g) => !g.dead && g.str.trim() === '"')) {
    const right = pool
      .filter((g) => !g.dead && g.str.trim() === "#" && g.x > left.x && Math.abs(g.y - left.y) < 1.5)
      .sort((a, b) => a.x - b.x)[0];
    if (!right) continue;
    const rows = pool.filter((g) => !g.dead && rowRe.test(g.str.trim()) && g.x >= left.x && g.x <= right.x && g.y >= left.y - 2 && g.y <= left.y + left.size * 3.3);
    if (rows.length === 0) continue;
    rows.sort((a, b) => a.y - b.y);
    const body = rows.map((r) => r.str.trim().split("&").map((c) => c.replace(/^-|^−/, "-")).join(" & ")).join(" \\\\ ");
    for (const g of [...rows, left, right]) g.dead = true;
    const mid = (rows[0].y + rows[rows.length - 1].y) / 2;
    pool.push({ x: left.x, w: right.x + right.w - left.x, y: mid, size: left.size, str: "", latex: `\\begin{bmatrix} ${body} \\end{bmatrix}` });
  }
}

/** A slash drawn over an equals sign ("̸" then "=") is "not equal to". */
function joinNotEqual(pool: G[]): void {
  for (const slash of pool.filter((g) => g.str.trim() === "\u0338")) {
    const eq = pool.find((g) => g !== slash && !g.dead && g.str.startsWith("=") && Math.abs(g.x - slash.x) < 1.5 && Math.abs(g.y - slash.y) < 1.5);
    if (!eq) continue;
    eq.str = "≠" + eq.str.slice(1);
    eq.orig = undefined;
    slash.dead = true;
  }
}

function applyRules(pool: G[], rules: Rule[], body: number): void {
  const sorted = [...rules].filter((r) => r.x1 - r.x0 >= 2.5).sort((a, b) => a.x1 - a.x0 - (b.x1 - b.x0));
  for (const r of sorted) {
    const live = pool.filter((g) => !g.dead);
    // A square root: its sign ends where the line begins.
    const sign = live.find((g) => g.str.trim() === "√" && Math.abs(r.x0 - endOf(g)) <= 3.2 && r.y < g.y + g.size * 0.6 && r.y > g.y - g.size * 2.4);
    if (sign) {
      // The number under the root may be the first word of a longer piece of text.
      for (const g of live) {
        if (g === sign || g.latex || g.x < r.x0 - 1.5 || g.x > r.x1 || !(g.y > r.y + 0.1 && g.y <= r.y + sign.size * 1.05 + 0.8)) continue;
        // Cut where the line ends: at the first space, or after as many characters as fit under it.
        const per = g.w / Math.max(g.str.length, 1);
        const space = g.str.search(/\s/);
        let at = space > 0 && g.x + space * per <= r.x1 + 2.5 ? space : Math.round((r.x1 - g.x) / per);
        if (at < 1 || at >= g.str.length) continue;
        if (g.x + g.w <= r.x1 + 2.5) continue;
        if (space > 0 && space < at) at = space;
        const [head, rest] = cut(g, at, true);
        g.dead = true;
        pool.push(head, rest);
      }
      const inside = pool.filter((g) => !g.dead && g !== sign && g.x >= r.x0 - 1.5 && g.x + g.w * 0.5 <= r.x1 + 1.5 && g.y > r.y + 0.1 && g.y <= r.y + sign.size * 1.05 + 0.8);
      if (inside.length > 0) {
        const index = live.filter((g) => g !== sign && g.size < sign.size * 0.95 && g.x < sign.x + 1 && g.x >= sign.x - 8 && g.y < sign.y - 0.5 && g.y > sign.y - sign.size * 1.5);
        const content = renderGroup(inside);
        const idx = index.length ? `[${renderGroup(index)}]` : "";
        for (const g of [...inside, ...index, sign]) g.dead = true;
        const ys = inside.map((g) => g.y);
        pool.push({ x: sign.x - (index.length ? 4 : 0), w: r.x1 - sign.x, y: median(ys), size: Math.max(...inside.map((g) => g.size)), str: "", latex: `\\sqrt${idx}{${content}}` });
        continue;
      }
    }
    // A fraction: something above the line and something below it.
    const near = live.filter((g) => g.x >= r.x0 - 3 && g.x < r.x1 + 0.5 && g.x + g.w * 0.5 <= r.x1 + 2.5 && Math.abs(g.y - r.y) <= 24);
    if (near.length === 0) continue;
    const s0 = Math.max(...near.map((g) => g.size));
    const num = near.filter((g) => g.y - r.y <= 0.8 && r.y - g.y <= s0 + 3.4);
    const den = near.filter((g) => g.y - r.y > 0.8 && g.y - r.y <= s0 * 1.1 + 6.5);
    if (num.length === 0 || den.length === 0) continue;
    // A real fraction bar is about as wide as the widest of its two parts. Table borders and underlines are not.
    const all = [...num, ...den];
    const span = Math.max(...all.map(endOf)) - Math.min(...all.map((g) => g.x));
    if (r.x1 - r.x0 > 220 || span < (r.x1 - r.x0) * 0.7 || span > r.x1 - r.x0 + 8) continue;
    const top = renderGroup(num);
    const bottom = renderGroup(den);
    for (const g of [...num, ...den]) g.dead = true;
    const level = s0 <= body * 0.9 ? s0 / 0.73 : s0;
    pool.push({ x: Math.min(...[...num, ...den].map((g) => g.x)), w: r.x1 - r.x0, y: r.y + AXIS * level, size: level, str: "", latex: `\\frac{${top}}{${bottom}}` });
  }
}

// ---------------------------------------------------------------------------------------------
// Whole pages
// ---------------------------------------------------------------------------------------------

function mode(values: number[]): number {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = values[0] ?? 10;
  let n = 0;
  for (const [v, c] of counts) if (c > n) [best, n] = [v, c];
  return best;
}

function toItem(g: G, template: TextItem, str: string): TextItem {
  return { page: template.page, pageHeight: template.pageHeight, x: g.x, y: g.y, w: g.w, str, size: g.size };
}

function convertPage(items: TextItem[], rules: Rule[]): TextItem[] {
  const template = items[0];
  const blank = items.filter((i) => !i.str.trim());
  const gs: G[] = items
    .filter((i) => i.str.trim())
    .map((i) => {
      let str = i.str;
      let hatNext = false;
      if (/ˆ\s*$/.test(str) && str.trim().length > 1) {
        str = str.replace(/ˆ\s*$/, "");
        hatNext = true;
      }
      return { x: i.x, w: i.w, y: i.y, size: i.size ?? 10, str, orig: hatNext ? undefined : i, hatNext, big: hasControl(i.str) };
    });
  const body = mode(gs.flatMap((g) => Array<number>(Math.max(1, g.str.length)).fill(Math.round(g.size * 10) / 10)));
  const pool = [...gs];
  joinNotEqual(pool);
  applyMatrices(pool);
  applyRules(pool, rules, body);

  // Everything that is not part of a fraction or root yet.
  const toks = buildTokens(pool.filter((g) => !g.dead), body);
  toks.sort((a, b) => a.g.y - b.g.y || a.g.x - b.g.x);

  // Rows: tokens whose baselines are within 3 points.
  const rows: Tok[][] = [];
  for (const t of toks) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row[0].g.y - t.g.y) <= 3) row.push(t);
    else rows.push([t]);
  }

  const out: TextItem[] = [...blank];
  const plain: TextItem[] = [];
  const emitPlain = (g: G) => {
    const item = g.orig ?? toItem(g, template, g.str);
    plain.push(item);
    out.push(item);
  };
  const merged: TextItem[] = [];

  for (const original of rows) {
    const row = pullNeighbours(original.sort((a, b) => a.g.x - b.g.x));
    const kinds = row.map(kindOf);
    let i = 0;
    while (i < row.length) {
      if (kinds[i] === "T") {
        emitPlain(row[i].g);
        i += 1;
        continue;
      }
      // A run of E and N tokens with small gaps.
      let j = i;
      while (j + 1 < row.length && kinds[j + 1] !== "T" && row[j + 1].g.x - tokEnd(row[j]) <= RUN_GAP) j += 1;
      let a = i;
      let b = j;
      let hasE = false;
      for (let k = a; k <= b; k += 1) if (kinds[k] === "E") hasE = true;
      if (!hasE) {
        for (let k = a; k <= b; k += 1) emitPlain(row[k].g);
        i = j + 1;
        continue;
      }
      // Sentence punctuation at either end stays outside the formula.
      const punct = (t: Tok) => kindOf(t) === "N" && /^[\s.,;:?!]*$/.test(t.g.str) && !t.sup.length && !t.sub.length;
      const before: G[] = [];
      const after: G[] = [];
      while (a < b && punct(row[a])) before.push(row[a++].g);
      while (b > a && punct(row[b])) after.unshift(row[b--].g);
      for (const g of before) emitPlain(g);
      merged.push(...makeRun(row.slice(a, b + 1), template));
      for (const g of after) emitPlain(g);
      i = j + 1;
    }
  }

  // A run sits on the baseline of the text beside it, so the rows of the page stay together.
  for (const m of merged) {
    const mate = plain.find((p) => Math.abs(p.y - m.y) <= 1.9 && p.x < m.x);
    if (mate) m.y = mate.y;
    // Words next to a formula keep a space between them.
    const side = plain.filter((p) => Math.abs(p.y - m.y) <= 3 && p.str.trim());
    const left = side.filter((p) => p.x + p.w <= m.x + 3.5).sort((a, b) => b.x + b.w - (a.x + a.w))[0];
    const right = side.filter((p) => p.x >= m.x + m.w - 3.5).sort((a, b) => a.x - b.x)[0];
    if (left && m.x - (left.x + left.w) < 8 && /[A-Za-z0-9)]\s*$/.test(left.str) && !/\s$/.test(left.str)) m.str = ` ${m.str}`;
    if (right && right.x - (m.x + m.w) < 8 && /^[A-Za-z0-9(]/.test(right.str)) m.str = `${m.str} `;
    out.push(m);
  }
  return out;
}

/** True when the tokens from `from` onward, joined by small gaps, include a formula. */
function seqHasE(row: Tok[], kinds: Kind[], from: number): boolean {
  for (let k = from; k < row.length; k += 1) {
    if (kinds[k] === "T") return false;
    if (kinds[k] === "E") return true;
    if (k + 1 < row.length && row[k + 1].g.x - tokEnd(row[k]) > RUN_GAP) return false;
  }
  return false;
}

/** Cuts a piece off the end or the start of a text piece, keeping the sizes in proportion. */
function cut(g: G, at: number, fromEnd: boolean): [G, G] {
  const total = g.str.length || 1;
  const left = copy(g, { str: g.str.slice(0, at), w: (g.w * at) / total });
  const right = copy(g, { str: g.str.slice(at), x: g.x + (g.w * at) / total, w: (g.w * (total - at)) / total });
  return fromEnd ? [left, right] : [left, right];
}

const NUM_TAIL = /(?:^|[\s(\[{=+\-−×·])(\d+(?:\.\d+)?)\s*$/;
const OPEN_TAIL = /([(\[{=+\-−×·])\s*$/;

/**
 * Words and numbers right beside a formula belong to it: the "sin" of "sin 75°", the "(" of "(x + 2y)10",
 * the "2" of "2a sin x". They are cut out of the neighbouring text.
 */
function pullNeighbours(row: Tok[]): Tok[] {
  const out: Tok[] = [];
  const kinds = row.map(kindOf);
  for (let i = 0; i < row.length; i += 1) {
    const t = row[i];
    if (kinds[i] !== "T" || t.sup.length || t.sub.length || t.g.latex) {
      out.push(t);
      continue;
    }
    let g = t.g;
    const next = row[i + 1];
    const prev = out[out.length - 1];
    const heads: G[] = [];
    const tails: G[] = [];
    // The start of this text belongs to the formula before it (a closing bracket).
    if (prev && kindOf(prev) !== "T" && g.x - tokEnd(prev) <= 4.5) {
      const m = /^\s*(?:[+\-−=×·\d]\s*)*[)\]}]*(?=\s*[^\d\s)\]}+\-−=×·]|\s*$)/.exec(g.str);
      if (m && m[0].trim() && m[0].length < g.str.length) {
        const [h, rest] = cut(g, m[0].length, false);
        heads.push(h);
        g = rest;
      }
    }
    // The end of this text belongs to the formula after it.
    if (next && kinds[i + 1] !== "T" && seqHasE(row, kinds, i + 1) && next.g.x - endOf(g) <= 4.5) {
      for (let n = 0; n < 3; n += 1) {
        const f = FUNC_TAIL.exec(g.str);
        const num = NUM_TAIL.exec(g.str);
        const open = OPEN_TAIL.exec(g.str);
        const hit = f ? { at: g.str.length - f[0].length + (f[0].length - f[1].length - (/\s*$/.exec(f[0])?.[0].length ?? 0)) } : num ? { at: g.str.lastIndexOf(num[1]) } : open ? { at: g.str.lastIndexOf(open[1]) } : null;
        if (!hit || hit.at <= 0 || hit.at >= g.str.length) break;
        const [rest, tail] = cut(g, hit.at, true);
        if (!rest.str.trim()) break;
        tails.unshift(tail);
        g = rest;
      }
    }
    for (const h of heads) out.push({ g: h, sup: [], sub: [] });
    out.push({ g, sup: [], sub: [] });
    for (const tl of tails) out.push({ g: tl, sup: [], sub: [] });
  }
  return out;
}

/** Writes one run of tokens as a single "$...$" piece. */
function makeRun(run: Tok[], template: TextItem): TextItem[] {
  const latex = tokensToLatex(run);
  if (!latex) return [];
  const xs = run.map((t) => t.g.x);
  const ends = run.flatMap((t) => [endOf(t.g), ...t.sup.map(endOf), ...t.sub.map(endOf)]);
  const real = run.filter((t) => !t.g.latex);
  const y = real.length ? median(real.map((t) => t.g.y)) : median(run.map((t) => t.g.y));
  const x = Math.min(...xs);
  return [{ page: template.page, pageHeight: template.pageHeight, x, y, w: Math.max(...ends) - x, str: `$${latex}$`, size: Math.max(...run.map((t) => t.g.size)) }];
}

/**
 * Rebuilds the maths on every page of a PDF. Needs `size` on each item; without it the items are returned as they came.
 * Text with no maths in it comes back unchanged.
 */
export function mathify(items: TextItem[], rules: Rule[]): TextItem[] {
  if (items.length === 0 || items.some((i) => !i.size)) return items;
  const pages = [...new Set(items.map((i) => i.page))];
  return pages.flatMap((page) =>
    convertPage(
      items.filter((i) => i.page === page),
      rules.filter((r) => r.page === page),
    ),
  );
}
