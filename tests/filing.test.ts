import { describe, expect, it } from "vitest";
import { checkFiling, findByName, NEW_SUBJECT, uniqueSlug } from "../lib/filing";

const subjects = [
  { id: "s1", name: "Mathematics", sort_order: 1, cover_path: null, exams: [] },
  { id: "s2", name: "Physics", sort_order: 2, cover_path: null, exams: [] },
];
const chapters = [{ id: "c1", subject_id: "s1", name: "Trigonometry", sort_order: 1 }];

describe("findByName", () => {
  it("ignores capitals and extra spaces", () => {
    expect(findByName(subjects, "  mathematics ")?.id).toBe("s1");
    expect(findByName(subjects, "Biology")).toBeUndefined();
    expect(findByName(subjects, "   ")).toBeUndefined();
  });
});

describe("uniqueSlug", () => {
  it("adds a number when the slug is taken", () => {
    expect(uniqueSlug("Biology", new Set())).toBe("biology");
    expect(uniqueSlug("Biology", new Set(["biology"]))).toBe("biology-2");
    expect(uniqueSlug("Biology", new Set(["biology", "biology-2"]))).toBe("biology-3");
    expect(uniqueSlug("???", new Set())).toBeNull();
  });
});

describe("checkFiling", () => {
  it("reuses an existing subject and chapter typed in different capitals", () => {
    const out = checkFiling({ subjectChoice: NEW_SUBJECT, newSubjectName: "mathematics", chapterName: "trigonometry" }, subjects, chapters);
    expect(out.ok && out.existingSubject?.id).toBe("s1");
    expect(out.ok && out.existingChapter?.id).toBe("c1");
  });
  it("marks a brand new subject and chapter as new", () => {
    const out = checkFiling({ subjectChoice: NEW_SUBJECT, newSubjectName: "Geology", chapterName: "Rocks" }, subjects, chapters);
    expect(out).toMatchObject({ ok: true, subjectName: "Geology", existingSubject: null, chapterName: "Rocks", existingChapter: null });
  });
  it("allows no chapter, and rejects a one-letter chapter", () => {
    expect(checkFiling({ subjectChoice: "s2", newSubjectName: "", chapterName: "" }, subjects, chapters)).toMatchObject({ ok: true, chapterName: "" });
    expect(checkFiling({ subjectChoice: "s2", newSubjectName: "", chapterName: "X" }, subjects, chapters).ok).toBe(false);
  });
  it("needs a subject", () => {
    expect(checkFiling({ subjectChoice: "", newSubjectName: "", chapterName: "" }, subjects, chapters).ok).toBe(false);
    expect(checkFiling({ subjectChoice: NEW_SUBJECT, newSubjectName: "A", chapterName: "" }, subjects, chapters).ok).toBe(false);
  });
});
