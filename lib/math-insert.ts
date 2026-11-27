/** Marks where the cursor lands after a key inserts its LaTeX. Any selected text goes there. */
export const CURSOR = "‸";

/** True when the position sits between a pair of dollar signs. An escaped \$ does not count. */
export function insideMath(text: string, pos: number): boolean {
  const before = text.slice(0, pos).replace(/\\\$/g, "");
  return (before.split("$").length - 1) % 2 === 1;
}

export interface Edit {
  text: string;
  /** Where the cursor goes. */
  cursor: number;
}

/**
 * Puts a piece of LaTeX into the text at the cursor, replacing any selection.
 * Outside an equation it is wrapped in dollar signs. Inside one it goes in as it is.
 * Selected text is kept: it fills the spot marked CURSOR.
 */
export function insertMath(text: string, start: number, end: number, tex: string): Edit {
  const from = Math.max(0, Math.min(start, end));
  const to = Math.min(text.length, Math.max(start, end));
  const selected = text.slice(from, to);
  const at = tex.indexOf(CURSOR);
  const plain = tex.replace(CURSOR, selected);
  const inside = insideMath(text, from);
  const body = inside ? plain : `$${plain}$`;
  const lead = inside ? 0 : 1;
  // A key with no slot (π, ≤) leaves the cursor after the equation so typing carries on in plain text.
  const after = !inside && at < 0 && !selected ? 1 : 0;
  const cursor = from + lead + (at < 0 || selected ? plain.length : at) + after;
  return { text: text.slice(0, from) + body + text.slice(to), cursor };
}

/** Moves the cursor one place, hopping over the "}{" between two parts of a fraction or root. */
export function stepCursor(text: string, pos: number, dir: -1 | 1): number {
  let next = Math.max(0, Math.min(text.length, pos + dir));
  if (dir === 1 && text[next - 1] === "}" && text[next] === "{") next += 1;
  if (dir === -1 && text[next - 1] === "}" && text[next] === "{") next -= 1;
  return Math.max(0, Math.min(text.length, next));
}

export interface MathKey {
  /** What the key shows. */
  label: string;
  /** Said by screen readers and shown on hover. */
  name: string;
  /** The LaTeX it inserts. */
  tex: string;
}

export interface KeyGroup {
  id: string;
  title: string;
  keys: MathKey[];
}

const k = (label: string, name: string, tex: string): MathKey => ({ label, name, tex });

export const KEY_GROUPS: KeyGroup[] = [
  {
    id: "basic",
    title: "Basic",
    keys: [
      k("a/b", "Fraction", `\\frac{${CURSOR}}{}`),
      k("xⁿ", "Power", `^{${CURSOR}}`),
      k("xₙ", "Subscript", `_{${CURSOR}}`),
      k("√", "Square root", `\\sqrt{${CURSOR}}`),
      k("ⁿ√", "Nth root", `\\sqrt[]{${CURSOR}}`),
      k("|x|", "Absolute value", `\\left|${CURSOR}\\right|`),
      k("( )", "Brackets", `\\left(${CURSOR}\\right)`),
      k("±", "Plus or minus", "\\pm "),
      k("×", "Times", "\\times "),
      k("÷", "Divide", "\\div "),
      k("·", "Dot", "\\cdot "),
      k("≤", "Less than or equal", "\\le "),
      k("≥", "Greater than or equal", "\\ge "),
      k("≠", "Not equal", "\\ne "),
      k("≈", "Approximately", "\\approx "),
      k("°", "Degree", "^{\\circ}"),
      k("∞", "Infinity", "\\infty "),
      k("%", "Percent", "\\%"),
    ],
  },
  {
    id: "calculus",
    title: "Calculus",
    keys: [
      k("∫", "Integral", `\\int ${CURSOR}\\,dx`),
      k("∫ₐᵇ", "Definite integral", `\\int_{}^{} ${CURSOR}\\,dx`),
      k("∑", "Sum", `\\sum_{}^{} ${CURSOR}`),
      k("∏", "Product", `\\prod_{}^{} ${CURSOR}`),
      k("lim", "Limit", `\\lim_{x\\to ${CURSOR}} `),
      k("dy/dx", "Derivative", "\\frac{dy}{dx}"),
      k("d²y/dx²", "Second derivative", "\\frac{d^{2}y}{dx^{2}}"),
      k("∂", "Partial", "\\partial "),
      k("→", "Tends to", "\\to "),
      k("log", "Log", "\\log_{}"),
      k("ln", "Natural log", "\\ln "),
      k("eˣ", "e to the power", `e^{${CURSOR}}`),
    ],
  },
  {
    id: "trig",
    title: "Trig",
    keys: [
      k("sin", "Sine", "\\sin "),
      k("cos", "Cosine", "\\cos "),
      k("tan", "Tangent", "\\tan "),
      k("cot", "Cotangent", "\\cot "),
      k("sec", "Secant", "\\sec "),
      k("cosec", "Cosecant", "\\csc "),
      k("sin⁻¹", "Inverse sine", "\\sin^{-1}"),
      k("cos⁻¹", "Inverse cosine", "\\cos^{-1}"),
      k("tan⁻¹", "Inverse tangent", "\\tan^{-1}"),
      k("sin²", "Sine squared", "\\sin^{2}"),
      k("cos²", "Cosine squared", "\\cos^{2}"),
      k("∠", "Angle", "\\angle "),
      k("△", "Triangle", "\\triangle "),
      k("⊥", "Perpendicular", "\\perp "),
      k("∥", "Parallel", "\\parallel "),
    ],
  },
  {
    id: "greek",
    title: "Greek",
    keys: ["α", "β", "γ", "δ", "ε", "θ", "λ", "μ", "π", "ρ", "σ", "τ", "φ", "ω", "Δ", "Σ", "Ω", "Φ", "Θ", "Λ"].map((ch) => {
      const names: Record<string, string> = { α: "alpha", β: "beta", γ: "gamma", δ: "delta", ε: "epsilon", θ: "theta", λ: "lambda", μ: "mu", π: "pi", ρ: "rho", σ: "sigma", τ: "tau", φ: "phi", ω: "omega", Δ: "Delta", Σ: "Sigma", Ω: "Omega", Φ: "Phi", Θ: "Theta", Λ: "Lambda" };
      return k(ch, names[ch], `\\${names[ch]} `);
    }),
  },
  {
    id: "more",
    title: "More",
    keys: [
      k("v⃗", "Vector", `\\vec{${CURSOR}}`),
      k("â", "Unit vector", `\\hat{${CURSOR}}`),
      k("x̄", "Bar", `\\overline{${CURSOR}}`),
      k("[2×2]", "2 by 2 matrix", "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}"),
      k("[3×3]", "3 by 3 matrix", "\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}"),
      k("|A|", "Determinant", "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}"),
      k("ⁿCᵣ", "Combination", "{}^{n}C_{r}"),
      k("ⁿPᵣ", "Permutation", "{}^{n}P_{r}"),
      k("∈", "Belongs to", "\\in "),
      k("⊂", "Subset", "\\subset "),
      k("∪", "Union", "\\cup "),
      k("∩", "Intersection", "\\cap "),
      k("∅", "Empty set", "\\emptyset "),
      k("ℝ", "Real numbers", "\\mathbb{R}"),
      k("⇒", "Implies", "\\Rightarrow "),
      k("⇔", "If and only if", "\\Leftrightarrow "),
      k("∴", "Therefore", "\\therefore "),
      k("…", "Dots", "\\ldots "),
    ],
  },
];
