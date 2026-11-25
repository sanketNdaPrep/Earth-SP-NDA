import { describe, expect, it } from "vitest";
import { blankQuestion, fillMissingExplanations, fromDraft, insertAfter, moveItem, questionProblems, signatureOf, summarise } from "../lib/test-questions";

const good = () => ({
  ...blankQuestion(),
  text: "What is 2 + 2?",
  options: { A: "3", B: "4", C: "5", D: "6" },
  correct: "B" as const,
});

describe("questionProblems", () => {
  it("passes a finished question", () => {
    expect(questionProblems(good())).toEqual([]);
  });
  it("lists what is missing on a blank question", () => {
    const problems = questionProblems(blankQuestion());
    expect(problems).toContain("Write the question.");
    expect(problems.join(" ")).toMatch(/Fill in option A, B, C, D/);
    expect(problems).toContain("Choose the correct option.");
  });
  it("catches a repeated option", () => {
    const q = good();
    q.options.C = "3";
    expect(questionProblems(q).join(" ")).toMatch(/Option C repeats/);
  });
  it("never blocks a shared bank question", () => {
    expect(questionProblems({ ...blankQuestion(), owned: false })).toEqual([]);
  });
});

describe("summarise", () => {
  it("counts ready, unfinished and flagged questions", () => {
    const flagged = { ...good(), flags: ["No explanation was found."] };
    const result = summarise([good(), flagged, blankQuestion(), { ...blankQuestion(), owned: false }]);
    expect(result).toEqual({ total: 4, ready: 3, needWork: 1, flagged: 1 });
  });
});

describe("fromDraft", () => {
  it("copies a PDF reading into an editable question", () => {
    const q = fromDraft({ number: 3, tag: "Short Direct", text: "T", options: { A: "a", B: "b", C: "c", D: "d" }, correct: null, explanation: "", flags: ["No answer was found for this question."] });
    expect(q.owned).toBe(true);
    expect(q.id).toBeNull();
    expect(q.correct).toBe("");
    expect(q.tag).toBe("Short Direct");
    expect(q.flags).toHaveLength(1);
  });
});

describe("signatureOf", () => {
  it("changes when the question is edited, not when only its place moves", () => {
    const q = good();
    const before = signatureOf(q);
    expect(signatureOf({ ...q, key: "other" })).toBe(before);
    expect(signatureOf({ ...q, explanation: "Because." })).not.toBe(before);
  });
});

describe("moveItem and insertAfter", () => {
  it("moves one step and stays put at the ends", () => {
    expect(moveItem([1, 2, 3], 1, -1)).toEqual([2, 1, 3]);
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
    expect(moveItem([1, 2, 3], 2, 1)).toEqual([1, 2, 3]);
  });
  it("inserts after an index or at the end", () => {
    expect(insertAfter([1, 2, 3], 0, 9)).toEqual([1, 9, 2, 3]);
    expect(insertAfter([1, 2, 3], -1, 9)).toEqual([1, 2, 3, 9]);
  });
});

describe("fillMissingExplanations", () => {
  const draft = (text: string, explanation: string) => ({ number: 1, tag: "", text, options: { A: "a", B: "b", C: "c", D: "d" }, correct: "A" as const, explanation, flags: [] });
  it("fills empty explanations by text and keeps written ones", () => {
    const a = { ...good(), text: "Which river is longest?" };
    const b = { ...good(), text: "Capital of India?", explanation: "My own note" };
    const result = fillMissingExplanations([a, b], [draft("Which river is longest?", "The Nile."), draft("Capital of India?", "Pdf note")]);
    expect(result.filled).toBe(1);
    expect(result.list.map((q) => q.explanation)).toEqual(["The Nile.", "My own note"]);
  });
  it("falls back to position when the counts match", () => {
    const a = { ...good(), text: "Edited wording" };
    const result = fillMissingExplanations([a], [draft("Original wording", "By place.")]);
    expect(result.list[0].explanation).toBe("By place.");
  });
  it("does not guess by position when the counts differ", () => {
    const a = { ...good(), text: "Edited wording" };
    const result = fillMissingExplanations([a], [draft("One", "x"), draft("Two", "y")]);
    expect(result.filled).toBe(0);
  });
});
