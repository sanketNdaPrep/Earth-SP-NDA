import { describe, expect, it } from "vitest";
import { chapterPdfName, fileSlug, pageSize, pictureFileName } from "../lib/flashcard-download";

describe("flashcard download names", () => {
  it("makes safe slugs", () => {
    expect(fileSlug("Polity & Economy")).toBe("polity-economy");
    expect(fileSlug("???")).toBe("flashcards");
  });
  it("names chapter PDFs", () => {
    expect(chapterPdfName("Mathematics", "Trigonometry")).toBe("mathematics-trigonometry-flashcards.pdf");
  });
  it("keeps the picture extension and position", () => {
    expect(pictureFileName("Physics", "Laws of Motion", 3, "cards/abc-x.webp")).toBe("physics-laws-of-motion-card-3.webp");
    expect(pictureFileName("Physics", null, 1, "cards/abc")).toBe("physics-card-1.jpg");
  });
  it("sizes pages by the picture shape", () => {
    expect(pageSize(1000, 500)).toEqual({ width: 842, height: 421 });
    expect(pageSize(0, 0)).toEqual({ width: 595, height: 842 });
  });
});
