import { describe, expect, it } from "vitest";
import { buildFolders, chapterNameProblem, groupBySubject, itemInExam, parseChapterList, subjectInExam } from "../lib/taxonomy";

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

describe("buildFolders", () => {
  const subjects = [
    { id: "s2", name: "Physics", sort_order: 2, cover_path: null, exams: [] },
    { id: "s1", name: "Mathematics", sort_order: 1, cover_path: null, exams: [] },
    { id: "s3", name: "Biology", sort_order: 3, cover_path: null, exams: [] },
  ];
  const chapters = [
    { id: "c1", subject_id: "s1", name: "Algebra", sort_order: 1 },
    { id: "c2", subject_id: "s1", name: "Calculus", sort_order: 2 },
  ];
  const items = [
    { subject_id: "s1", chapter_id: "c1" },
    { subject_id: "s1", chapter_id: "c1" },
    { subject_id: "s1", chapter_id: null },
    { subject_id: "s2", chapter_id: null },
  ];

  it("lists every subject in order, even empty ones", () => {
    const folders = buildFolders(items, subjects, chapters);
    expect(folders.map((f) => f.subject.name)).toEqual(["Mathematics", "Physics", "Biology"]);
    expect(folders[2].count).toBe(0);
  });

  it("counts chapters, keeps empty chapters and counts loose items", () => {
    const [maths] = buildFolders(items, subjects, chapters);
    expect(maths.chapters).toEqual([
      { id: "c1", name: "Algebra", cover_path: null, count: 2 },
      { id: "c2", name: "Calculus", cover_path: null, count: 0 },
    ]);
    expect(maths.looseCount).toBe(1);
    expect(maths.count).toBe(3);
  });
});

describe("exam filtering", () => {
  it("shows untagged items under every exam and tagged items only under theirs", () => {
    expect(itemInExam([], "nda")).toBe(true);
    expect(itemInExam(["cds"], "nda")).toBe(false);
    expect(itemInExam(["nda", "cds"], "nda")).toBe(true);
    expect(itemInExam(["cds"], null)).toBe(true);
  });
  it("shows a subject under its own exams, under every exam when untagged, or when an item is tagged", () => {
    const physics = { id: "p", exams: ["nda"] };
    expect(subjectInExam(physics, [], "nda")).toBe(true);
    expect(subjectInExam(physics, [], "cds")).toBe(false);
    expect(subjectInExam(physics, [{ subject_id: "p", exams: ["cds"] }], "cds")).toBe(true);
    expect(subjectInExam({ id: "x", exams: [] }, [], "afcat")).toBe(true);
  });
});

describe("parseChapterList", () => {
  it("reads one chapter per line and strips bullets and numbering", () => {
    const out = parseChapterList("1. Algebra\n- Calculus\n* Trigonometry\n\n  Vectors  ", []);
    expect(out.names).toEqual(["Algebra", "Calculus", "Trigonometry", "Vectors"]);
    expect(out.skipped).toEqual([]);
  });
  it("skips repeats, existing chapters and bad lengths", () => {
    const out = parseChapterList("Algebra\nalgebra\nCalculus\nX\n" + "a".repeat(61), [{ name: "calculus" }]);
    expect(out.names).toEqual(["Algebra"]);
    expect(out.skipped.map((s) => s.reason)).toEqual(["already in the list", "already in the list", "needs 2 to 60 characters", "needs 2 to 60 characters"]);
  });
});
