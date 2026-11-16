import { describe, expect, it } from "vitest";
import { filterStudents, toExamSummaries, toRosterStudent } from "../lib/adminRoster";

describe("toRosterStudent", () => {
  it("reads a row and works out accuracy", () => {
    const row = toRosterStudent({ id: "1", full_name: " Asha ", email: "a@x.in", target_exam: "CDS", created_at: "2026-10-01T00:00:00Z", tests_taken: "2", correct: "14", questions: "20", last_attempt: null });
    expect(row).toMatchObject({ name: "Asha", targetExam: "CDS", testsTaken: 2, accuracy: 70, lastAttempt: null });
  });
  it("has no accuracy before a first test and names a cadet from the email", () => {
    const row = toRosterStudent({ id: "2", full_name: null, email: "bhanu@x.in", target_exam: "NDA", tests_taken: 0, correct: 0, questions: 0 });
    expect(row).toMatchObject({ name: "bhanu", accuracy: null, testsTaken: 0 });
  });
  it("skips a row with no id", () => {
    expect(toRosterStudent({})).toBeNull();
  });
});

describe("toExamSummaries", () => {
  it("always lists NDA, CDS and AFCAT, with zeros for empty exams", () => {
    const out = toExamSummaries([{ target_exam: "NDA", enrolled: 2, tests_taken: 2, correct: 14, questions: 20 }]);
    expect(out.map((e) => e.exam)).toEqual(["NDA", "CDS", "AFCAT"]);
    expect(out[0]).toEqual({ exam: "NDA", enrolled: 2, testsTaken: 2, accuracy: 70 });
    expect(out[1]).toEqual({ exam: "CDS", enrolled: 0, testsTaken: 0, accuracy: null });
  });
  it("keeps an unexpected exam name", () => {
    expect(toExamSummaries([{ target_exam: "SSB", enrolled: 1, tests_taken: 0, correct: 0, questions: 0 }]).map((e) => e.exam)).toEqual(["NDA", "CDS", "AFCAT", "SSB"]);
  });
});

describe("filterStudents", () => {
  const students = [
    toRosterStudent({ id: "1", full_name: "Asha Rao", email: "asha@x.in", target_exam: "NDA" })!,
    toRosterStudent({ id: "2", full_name: "Bhanu", email: "b@x.in", target_exam: "CDS" })!,
  ];
  it("searches name and email, case-insensitively", () => {
    expect(filterStudents(students, "ASHA", null)).toHaveLength(1);
    expect(filterStudents(students, "b@x", null)[0].id).toBe("2");
  });
  it("narrows by exam", () => {
    expect(filterStudents(students, "", "CDS")).toHaveLength(1);
    expect(filterStudents(students, "asha", "CDS")).toHaveLength(0);
  });
});
