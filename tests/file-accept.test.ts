import { describe, expect, it } from "vitest";
import { fileMatchesAccept, formatFileSize } from "../lib/file-accept";

describe("fileMatchesAccept", () => {
  const pdf = { name: "Notes.PDF", type: "application/pdf" };
  const png = { name: "cover.png", type: "image/png" };
  it("accepts anything when there is no list", () => {
    expect(fileMatchesAccept(pdf, undefined)).toBe(true);
    expect(fileMatchesAccept(pdf, "")).toBe(true);
  });
  it("matches by extension, type and wildcard", () => {
    expect(fileMatchesAccept(pdf, ".pdf")).toBe(true);
    expect(fileMatchesAccept(pdf, "application/pdf")).toBe(true);
    expect(fileMatchesAccept(png, "image/*")).toBe(true);
    expect(fileMatchesAccept(png, ".pdf,application/pdf")).toBe(false);
  });
  it("matches a file the browser gave no type", () => {
    expect(fileMatchesAccept({ name: "a.pdf", type: "" }, ".pdf,application/pdf")).toBe(true);
  });
});

describe("formatFileSize", () => {
  it("picks a readable unit", () => {
    expect(formatFileSize(12)).toBe("12 B");
    expect(formatFileSize(860 * 1024)).toBe("860 KB");
    expect(formatFileSize(4.8 * 1024 * 1024)).toBe("4.8 MB");
    expect(formatFileSize(150 * 1024 * 1024)).toBe("150 MB");
  });
});
