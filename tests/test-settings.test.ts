import { describe, expect, it } from "vitest";
import { accuracyOf, marksWithNegative } from "../lib/mockScoring";
import { checkMockTest, cutoffStanding, cutoffText, totalMarksOf, type MockTestDraft } from "../lib/test-settings";

const base: MockTestDraft = {
  title: "NDA Biology Cell Biology",
  kind: "chapter",
  hasSubject: true,
  hasChapter: true,
  duration: "45",
  marksPerCorrect: "2.5",
  negativeMarks: "0.83",
  cutoffMin: "",
  cutoffMax: "",
  published: false,
  questionCount: 50,
};

describe("marks with negative marking", () => {
  it("adds right answers and takes off wrong ones", () => {
    expect(marksWithNegative(30, 10, 2.5, 0.83)).toBe(66.7);
  });
  it("can go below zero", () => {
    expect(marksWithNegative(1, 10, 2.5, 0.83)).toBe(-5.8);
  });
  it("ignores unanswered questions and handles no negative marking", () => {
    expect(marksWithNegative(20, 5, 1, 0)).toBe(20);
  });
});

describe("accuracy", () => {
  it("is right answers out of answered questions", () => {
    expect(accuracyOf(30, 10)).toBe(75);
  });
  it("is null when nothing was answered", () => {
    expect(accuracyOf(0, 0)).toBeNull();
  });
});

describe("totals and cutoff", () => {
  it("works out total marks", () => {
    expect(totalMarksOf(50, 2.5)).toBe(125);
    expect(totalMarksOf(0, 2.5)).toBe(0);
  });
  it("places a score against the cutoff range", () => {
    expect(cutoffStanding(100, 110, 130)).toBe("below");
    expect(cutoffStanding(120, 110, 130)).toBe("within");
    expect(cutoffStanding(110, 110, 130)).toBe("within");
    expect(cutoffStanding(131, 110, 130)).toBe("above");
    expect(cutoffStanding(50, null, null)).toBeNull();
    expect(cutoffStanding(50, 60, null)).toBe("below");
  });
  it("words the range", () => {
    expect(cutoffText(280, 320)).toBe("280 to 320");
    expect(cutoffText(280, null)).toBe("280 and above");
    expect(cutoffText(null, 320)).toBe("up to 320");
    expect(cutoffText(null, null)).toBeNull();
    expect(cutoffText(100, 100)).toBe("100");
  });
});

describe("checkMockTest", () => {
  it("accepts a good chapter-wise test", () => {
    expect(checkMockTest(base)).toBeNull();
  });
  it("needs a subject for a subject-wise test and a chapter for a chapter-wise test", () => {
    expect(checkMockTest({ ...base, kind: "subject", hasSubject: false })).toMatch(/subject/i);
    expect(checkMockTest({ ...base, hasChapter: false })).toMatch(/chapter/i);
    expect(checkMockTest({ ...base, kind: "mock", hasSubject: false, hasChapter: false })).toBeNull();
  });
  it("has no cap on the number of questions", () => {
    expect(checkMockTest({ ...base, questionCount: 900 })).toBeNull();
  });
  it("checks marking and cutoff", () => {
    expect(checkMockTest({ ...base, marksPerCorrect: "0" })).toMatch(/right answer/i);
    expect(checkMockTest({ ...base, negativeMarks: "-1" })).toMatch(/wrong answer/i);
    expect(checkMockTest({ ...base, cutoffMin: "90", cutoffMax: "80" })).toMatch(/highest cutoff/i);
    expect(checkMockTest({ ...base, cutoffMin: "50", cutoffMax: "999" })).toMatch(/total marks/i);
    expect(checkMockTest({ ...base, cutoffMin: "abc" })).toMatch(/number/i);
    expect(checkMockTest({ ...base, cutoffMin: "80", cutoffMax: "100" })).toBeNull();
  });
  it("needs a time and a question before publishing", () => {
    expect(checkMockTest({ ...base, duration: "0" })).toMatch(/minutes/i);
    expect(checkMockTest({ ...base, published: true, questionCount: 0 })).toMatch(/at least one question/i);
  });
});
