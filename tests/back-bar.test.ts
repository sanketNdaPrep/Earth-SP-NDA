import { describe, expect, it } from "vitest";
import { parentOf } from "../lib/back-path";

describe("parentOf", () => {
  it("goes to the section for deeper pages", () => {
    expect(parentOf("/quizzes/abc/result/x")).toBe("/quizzes");
    expect(parentOf("/flashcards/abc")).toBe("/flashcards");
    expect(parentOf("/admin/questions/new")).toBe("/admin/questions");
    expect(parentOf("/admin/resources")).toBe("/admin/dashboard");
    expect(parentOf("/dashboard/analytics")).toBe("/dashboard");
    expect(parentOf("/exams/nda")).toBe("/");
    expect(parentOf("/login")).toBe("/");
  });
});
