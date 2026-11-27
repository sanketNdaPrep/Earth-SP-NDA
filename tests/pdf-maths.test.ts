import { describe, expect, it } from "vitest";
import { parseFixture } from "./helpers-pdf";

const squash = (s: string) => s.replace(/\s+/g, "");

describe("maths question PDF (LaTeX-made NDA mock)", async () => {
  const { result } = await parseFixture("tests/fixtures/maths-test30.pdf");
  const q = (n: number) => result.questions.find((x) => x.number === n)!;
  const opts = (n: number) => Object.values(q(n).options).join(" ");

  it("finds all 30 questions with answers and no warnings", () => {
    expect(result.questions).toHaveLength(30);
    expect(result.questions.every((x) => Object.values(x.options).every(Boolean) && x.correct)).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("rebuilds fractions", () => {
    expect(squash(opts(1))).toContain("\\frac{3}{5}");
  });

  it("rebuilds roots inside fractions", () => {
    expect(squash(opts(4))).toContain("\\frac{\\sqrt{3}-1}{2\\sqrt{2}}");
    expect(squash(q(9).text + opts(9))).toContain("10\\sqrt{3}");
  });

  it("rebuilds integrals with limits", () => {
    expect(squash(q(19).text + opts(19))).toContain("\\int_{0}^{1}\\frac{dx}{1+x^{2}}");
  });

  it("rebuilds powers after tall brackets", () => {
    expect(squash(q(25).text)).toContain("\\left(\\frac{d^{2}y}{dx^{2}}\\right)^{3}");
  });

  it("rebuilds limits and matrices", () => {
    expect(squash(opts(27))).toContain("\\lim_{x\\toa^{-}}");
    expect(squash(q(28).text)).toContain("\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}");
  });
});
