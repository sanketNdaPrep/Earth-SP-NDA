import { describe, expect, it } from "vitest";
import { buildQuestion, MENTOR_TEXT_MAX, questionProblem } from "../lib/mentor";

describe("mentor question", () => {
  it("prefixes the topic", () => {
    expect(buildQuestion("Maths", "  How do I revise trigonometry? ")).toBe("[Maths] How do I revise trigonometry?");
  });
  it("rejects too short and too long text", () => {
    expect(questionProblem("help")).not.toBeNull();
    expect(questionProblem("x".repeat(MENTOR_TEXT_MAX + 1))).not.toBeNull();
    expect(questionProblem("How should I plan my last two months?")).toBeNull();
  });
  it("always fits the database limit once prefixed", () => {
    const longest = buildQuestion("General awareness", "x".repeat(MENTOR_TEXT_MAX));
    expect(longest.length).toBeLessThanOrEqual(1000);
  });
});
