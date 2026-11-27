import { describe, expect, it } from "vitest";
import { joinBrokenFormulas, mathFlags, mathProblems } from "../lib/pdf-math-check";

describe("joinBrokenFormulas", () => {
  it("joins an equation broken around Greek letters", () => {
    expect(joinBrokenFormulas("the points $(a\\cos$ α, a $\\sin$ α) and")).toBe("the points $(a\\cos \\alpha , a \\sin \\alpha )$ and");
  });
  it("pulls a minus sign back into the equation", () => {
    expect(joinBrokenFormulas("is $\\sin ^{-1}($−$\\frac{1}{2})$ now")).toBe("is $\\sin ^{-1}(-\\frac{1}{2})$ now");
  });
  it("leaves balanced equations and plain prices alone", () => {
    expect(joinBrokenFormulas("costs $5 and $10 or $x^{2}$")).toBe("costs $5 and $10 or $x^{2}$");
  });
  it("does not swallow real words", () => {
    const text = "$f(x$ is defined everywhere";
    expect(joinBrokenFormulas(text)).toBe(text);
  });
});

describe("mathFlags", () => {
  const ok = { text: "Find $\\frac{1}{2}$", options: { A: "1", B: "2", C: "3", D: "4" }, explanation: "So $x=2$." };
  it("is quiet when the maths is fine", () => {
    expect(mathFlags(ok)).toEqual([]);
  });
  it("flags an equation that cannot be drawn", () => {
    expect(mathProblems("$\\frac{1}{$", "Question")[0]).toMatch(/could not be drawn|cut/);
  });
  it("flags symbols left outside an equation", () => {
    expect(mathFlags({ ...ok, text: "Find √ 3 here" })[0]).toMatch(/plain text/);
  });
  it("flags two identical options", () => {
    expect(mathFlags({ ...ok, options: { A: "$x$", B: "$x$", C: "3", D: "4" } }).join(" ")).toMatch(/same/);
  });
  it("allows a prefix superscript", () => {
    expect(mathProblems("${}^{n}P_{4}=12$", "Question")).toEqual([]);
  });
});
