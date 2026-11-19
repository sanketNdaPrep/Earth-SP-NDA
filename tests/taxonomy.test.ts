import { describe, expect, it } from "vitest";
import { chapterNameProblem, groupBySubject } from "../lib/taxonomy";

const subjects = [
  { id: "s2", name: "CDS", sort_order: 2, cover_path: null, exams: [] },
  { id: "s1", name: "NDA", sort_order: 1, cover_path: null, exams: [] },
];
const chapters = [
  { id: "c2", subject_id: "s1", name: "Physics", sort_order: 2 },
  { id: "c1", subject_id: "s1", name: "Maths", sort_order: 1 },
];

describe("chapterNameProblem", () => {
  it("checks length and duplicates", () => {
    expect(chapterNameProblem("a", [])).not.toBeNull();
    expect(chapterNameProblem(" maths ", chapters)).toMatch(/already has/);
    expect(chapterNameProblem("Maths", chapters, "c1")).toBeNull();
    expect(chapterNameProblem("Chemistry", chapters)).toBeNull();
  });
});

describe("groupBySubject", () => {
  const items = [
    { id: "a", subject_id: "s1", chapter_id: "c2" },
    { id: "b", subject_id: "s1", chapter_id: "c1" },
    { id: "c", subject_id: "s1", chapter_id: null },
    { id: "d", subject_id: null, chapter_id: null },
    { id: "e", subject_id: "gone", chapter_id: null },
  ];
  const sections = groupBySubject(items, subjects, chapters);

  it("orders subjects, then Other last, and skips empty subjects", () => {
    expect(sections.map((s) => s.subjectName)).toEqual(["NDA", "Other"]);
  });
  it("puts chapterless items first, then chapters in order", () => {
    expect(sections[0].chapters.map((g) => g.chapterName)).toEqual([null, "Maths", "Physics"]);
    expect(sections[0].chapters[1].items.map((i) => i.id)).toEqual(["b"]);
  });
  it("sends unknown subjects to Other", () => {
    expect(sections[1].chapters[0].items.map((i) => i.id)).toEqual(["d", "e"]);
  });
});

import { cleanExams, coverPath, EXAMS } from "../lib/subjects";

describe("exam tags and cover paths", () => {
  it("keeps only known exams, in a fixed order, once each", () => {
    expect(cleanExams(["afcat", "nda", "nda", "upsc"])).toEqual(["nda", "afcat"]);
    expect(cleanExams(null)).toEqual([]);
    expect(EXAMS.map((e) => e.id)).toEqual(["nda", "cds", "afcat"]);
  });
  it("builds a cover path from the file type, not the name", () => {
    expect(coverPath({ name: "My Biology Cover.PNG", type: "image/webp" }, "abc")).toBe("covers/abc-my-biology-cover.webp");
    expect(coverPath({ name: "???", type: "image/png" }, "abc")).toBe("covers/abc-cover.png");
  });
});
