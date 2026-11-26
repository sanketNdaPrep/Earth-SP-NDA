import { describe, expect, it } from "vitest";
import { pageAtOffset, pageHeightFor, pdfFileName, stepZoom } from "../lib/pdf-view";

describe("stepZoom", () => {
  it("moves one step and stops at the ends", () => {
    expect(stepZoom(1, 1)).toBe(1.25);
    expect(stepZoom(1, -1)).toBe(0.8);
    expect(stepZoom(3, 1)).toBe(3);
    expect(stepZoom(0.6, -1)).toBe(0.6);
  });
});

describe("pageAtOffset", () => {
  const heights = [100, 100, 100];
  it("finds the page under the line", () => {
    expect(pageAtOffset(0, heights, 10)).toBe(1);
    expect(pageAtOffset(105, heights, 10)).toBe(1);
    expect(pageAtOffset(115, heights, 10)).toBe(2);
    expect(pageAtOffset(10_000, heights, 10)).toBe(3);
  });
  it("has a page 1 for an empty list", () => {
    expect(pageAtOffset(50, [], 10)).toBe(1);
  });
});

describe("pageHeightFor", () => {
  it("keeps the page's shape", () => {
    expect(pageHeightFor(600, 595, 842)).toBe(849);
  });
  it("guards a zero width", () => {
    expect(pageHeightFor(600, 0, 0)).toBeGreaterThan(0);
  });
});

describe("pdfFileName", () => {
  it("cleans the title and adds .pdf once", () => {
    expect(pdfFileName('Set Theory: Notes?.pdf')).toBe("Set Theory Notes.pdf");
    expect(pdfFileName("   ")).toBe("document.pdf");
  });
});
