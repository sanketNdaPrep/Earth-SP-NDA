import { describe, expect, it } from "vitest";
import { subjectSyllabusName } from "../lib/pdf-upload";
import { SYLLABUS_TOPICS, topicCount } from "../lib/syllabus-topics";

describe("syllabus topics", () => {
  it("covers all three exams with unique subject slugs per exam", () => {
    for (const exam of ["nda", "cds", "afcat"] as const) {
      const slugs = SYLLABUS_TOPICS[exam].map((s) => s.slug);
      expect(slugs.length).toBeGreaterThan(5);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("keeps every unit of the NDA mathematics paper", () => {
    const maths = SYLLABUS_TOPICS.nda.find((s) => s.slug === "mathematics")!;
    expect(maths.units).toHaveLength(8);
    expect(topicCount(maths)).toBe(33);
  });

  it("has no empty text and no leftover PDF glyph junk", () => {
    for (const subjects of Object.values(SYLLABUS_TOPICS)) {
      for (const s of subjects) {
        for (const u of s.units) {
          expect(u.groups.length).toBeGreaterThan(0);
          for (const g of u.groups) {
            expect(g.text.length).toBeGreaterThan(20);
            expect(`${g.title ?? ""}${g.text}`).not.toMatch(/[\u0080-\u009f-]|\sP P\b/);
          }
        }
      }
    }
  });

  it("names the downloaded file after the exam and subject", () => {
    expect(subjectSyllabusName("NDA", "General Science and Biology")).toBe("nda-general-science-and-biology-syllabus.pdf");
  });
});
