import { describe, expect, it } from "vitest";
import { imagePath, imageProblem, recentPictures, stepIndex } from "../lib/flashcard-images";

describe("picture flashcards", () => {
  it("accepts PNG, JPG and WebP of any size", () => {
    expect(imageProblem({ name: "a.png", type: "image/png", size: 3 })).toBeNull();
    expect(imageProblem({ name: "big.jpg", type: "image/jpeg", size: 900 * 1024 * 1024 })).toBeNull();
    expect(imageProblem({ name: "c.webp", type: "image/webp", size: 10 })).toBeNull();
  });
  it("rejects other types and empty files", () => {
    expect(imageProblem({ name: "notes.pdf", type: "application/pdf", size: 10 })).toMatch(/not a PNG/);
    expect(imageProblem({ name: "empty.png", type: "image/png", size: 0 })).toMatch(/empty/);
  });
  it("builds a safe path from the file type, not the name", () => {
    expect(imagePath({ name: "Trig Formulas (1).JPG", type: "image/png" }, "abc")).toBe("cards/abc-trig-formulas-1.png");
    expect(imagePath({ name: "???.png", type: "image/png" }, "abc")).toBe("cards/abc-card.png");
  });
  it("returns the newest four first", () => {
    const items = ["2026-01-01", "2026-03-01", "2026-02-01", "2026-05-01", "2026-04-01"].map((d, i) => ({ id: i, created_at: `${d}T00:00:00Z` }));
    expect(recentPictures(items).map((x) => x.id)).toEqual([3, 4, 1, 2]);
    expect(recentPictures(items, 2)).toHaveLength(2);
    expect(recentPictures([])).toEqual([]);
  });
  it("wraps when stepping through pictures", () => {
    expect(stepIndex(0, -1, 5)).toBe(4);
    expect(stepIndex(4, 1, 5)).toBe(0);
    expect(stepIndex(2, 1, 5)).toBe(3);
    expect(stepIndex(0, 1, 0)).toBe(0);
  });
});
