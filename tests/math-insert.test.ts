import { describe, expect, it } from "vitest";
import { CURSOR, insertMath, insideMath, KEY_GROUPS, stepCursor } from "../lib/math-insert";

describe("insertMath", () => {
  it("wraps a key in dollar signs outside an equation", () => {
    const r = insertMath("Find ", 5, 5, `\\frac{${CURSOR}}{}`);
    expect(r.text).toBe("Find $\\frac{}{}$");
    expect(r.cursor).toBe("Find $\\frac{".length);
  });
  it("inserts as it is inside an equation", () => {
    const r = insertMath("$x$", 2, 2, `^{${CURSOR}}`);
    expect(r.text).toBe("$x^{}$");
    expect(r.cursor).toBe("$x^{".length);
  });
  it("keeps selected text in the slot", () => {
    const r = insertMath("root of x+1 is", 8, 11, `\\sqrt{${CURSOR}}`);
    expect(r.text).toBe("root of $\\sqrt{x+1}$ is");
    expect(r.cursor).toBe("root of $\\sqrt{x+1}".length);
  });
  it("puts the cursor after a key with no slot", () => {
    const r = insertMath("", 0, 0, "\\pi ");
    expect(r.text).toBe("$\\pi $");
    expect(r.cursor).toBe(6);
  });
  it("ignores an escaped dollar", () => {
    expect(insideMath("cost \\$5 ", 9)).toBe(false);
  });
});

describe("stepCursor", () => {
  it("hops over }{ in a fraction", () => {
    const t = "$\\frac{1}{2}$";
    expect(stepCursor(t, t.indexOf("1") + 1, 1)).toBe(t.indexOf("{2") + 1);
    expect(stepCursor(t, t.indexOf("{2") + 1, -1)).toBe(t.indexOf("1") + 1);
  });
});

describe("keys", () => {
  it("every key has a name and some LaTeX", () => {
    for (const g of KEY_GROUPS) for (const key of g.keys) expect(key.name && key.tex && key.label).toBeTruthy();
  });
});
