import { describe, expect, it } from "vitest";
import { PDF_MAX_BYTES, PDF_MAX_PAGES, pageCountProblem, pageCreatedAt, pagePicturePath, pdfDownloadName, pdfProblem, pictureSize, sourcePdfPath, syllabusDownloadName } from "../lib/pdf-upload";

describe("pdfProblem", () => {
  it("accepts a normal PDF", () => expect(pdfProblem({ name: "a.pdf", type: "application/pdf", size: 10 })).toBeNull());
  it("accepts a PDF whose type is blank", () => expect(pdfProblem({ name: "a.PDF", type: "", size: 10 })).toBeNull());
  it("rejects other files and empty files", () => {
    expect(pdfProblem({ name: "a.png", type: "image/png", size: 10 })).toMatch(/not a PDF/);
    expect(pdfProblem({ name: "a.pdf", type: "application/pdf", size: 0 })).toMatch(/empty/);
  });
  it("explains the 50 MB limit", () => expect(pdfProblem({ name: "big.pdf", type: "application/pdf", size: PDF_MAX_BYTES + 1 })).toMatch(/50 MB/));
});

describe("pageCountProblem", () => {
  it("allows up to the limit", () => expect(pageCountProblem("a.pdf", PDF_MAX_PAGES)).toBeNull());
  it("rejects too many or none", () => {
    expect(pageCountProblem("a.pdf", PDF_MAX_PAGES + 1)).toMatch(/Split it/);
    expect(pageCountProblem("a.pdf", 0)).toMatch(/no pages/);
  });
});

describe("names and sizes", () => {
  it("builds safe paths", () => {
    expect(sourcePdfPath("x", "My Notes (final).PDF")).toBe("pdfs/x-my-notes-final.pdf");
    expect(pagePicturePath("x", 3)).toBe("cards/x-page-3.jpg");
  });
  it("gives page 1 the newest time", () => {
    expect(Date.parse(pageCreatedAt(10_000, 1))).toBeGreaterThan(Date.parse(pageCreatedAt(10_000, 2)));
  });
  it("keeps the page shape and caps the long side", () => {
    expect(pictureSize(600, 800, 1600)).toEqual({ width: 1200, height: 1600 });
    expect(pictureSize(0, 0, 1600).height).toBe(1600);
  });
  it("names downloads", () => {
    expect(pdfDownloadName("Trig Notes.pdf")).toBe("trig-notes.pdf");
    expect(pdfDownloadName(null)).toBe("flashcards.pdf");
    expect(syllabusDownloadName("NDA")).toBe("nda-syllabus.pdf");
  });
});
