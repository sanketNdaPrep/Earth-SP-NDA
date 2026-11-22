import { describe, expect, it } from "vitest";
import { decodeText, isCompleteDraft, parseQuestionPdf, type TextItem } from "../lib/pdf-questions";

const H = 842;
/** One row of text on a page: pairs of [x, text]. */
const row = (page: number, y: number, ...cells: [number, string][]): TextItem[] =>
  cells.map(([x, str]) => ({ page, x, y, w: str.length * 5, pageHeight: H, str }));

/** Page footer, repeated on every page the way a real PDF does. */
const footers = (pages: number): TextItem[] => Array.from({ length: pages }, (_, i) => row(i + 1, 820, [45, `Page ${i + 1} of ${pages}`])).flat();

describe("decodeText", () => {
  it("turns private-use symbols back into characters", () => {
    expect(decodeText("Q")).toBe("Q01");
  });
  it("leaves normal text alone", () => {
    expect(decodeText("Na⁺/K⁺ pump")).toBe("Na⁺/K⁺ pump");
  });
});

describe("Q-numbered file with an answer-key table", () => {
  const items = [
    ...row(1, 60, [60, "Chapter 2: Genetics"]),
    ...row(1, 80, [60, "3 Practice Questions"]),
    // Question 1: two-column options, a wrapped statement
    ...row(1, 120, [60, "Q01"], [100, "Statement-Based"]),
    ...row(1, 140, [60, "Consider the following statements:"]),
    ...row(1, 156, [60, "1. Genes are made of DNA that is wrapped around"]),
    ...row(1, 171, [60, "histone proteins in the nucleus."]),
    ...row(1, 187, [60, "Which of the above is correct?"]),
    ...row(1, 210, [60, "(A)"], [80, "1 only"], [300, "(B)"], [320, "2 only"]),
    ...row(1, 228, [60, "(C)"], [80, "Both 1 and 2"], [300, "(D)"], [320, "Neither"]),
    // Question 2: a wrapped option in the right-hand column
    ...row(1, 270, [60, "Q02"], [100, "Assertion-Reason"]),
    ...row(1, 290, [60, "Assertion: Mitosis keeps the chromosome number."]),
    ...row(1, 310, [60, "(A)"], [80, "Both true and R explains A"], [300, "(B)"], [320, "Both true but R does"]),
    ...row(1, 325, [320, "not explain A"]),
    ...row(1, 343, [60, "(C)"], [80, "A is true, R is false"], [300, "(D)"], [320, "A is false, R is true"]),
    // Question 3: no answer in the key
    ...row(1, 400, [60, "Q03"], [100, "Short Direct"]),
    ...row(1, 420, [60, "What is the unit of heredity?"]),
    ...row(1, 440, [60, "(A)"], [80, "Gene"], [300, "(B)"], [320, "Cell"]),
    ...row(1, 458, [60, "(C)"], [80, "Tissue"], [300, "(D)"], [320, "Organ"]),
    // The key
    ...row(2, 75, [45, "Answer Key & Explanations"]),
    ...row(2, 110, [62, "Q"], [70, "No"], [104, "Ans"], [155, "Explanation"]),
    ...row(2, 150, [62, "Q"], [70, "0"], [77, "1"], [104, "B"]),
    ...row(2, 143, [155, "Histones are proteins, not the genes themselves, so"]),
    ...row(2, 158, [155, "only statement 2 holds."]),
    ...row(2, 195, [62, "Q"], [70, "0"], [77, "2"], [104, "A"], [155, "Mitosis gives two identical daughter cells."]),
    ...footers(2),
  ];
  const result = parseQuestionPdf(items);

  it("finds every question and its label", () => {
    expect(result.questions.map((q) => q.number)).toEqual([1, 2, 3]);
    expect(result.questions.map((q) => q.tag)).toEqual(["Statement-Based", "Assertion-Reason", "Short Direct"]);
  });
  it("keeps statements on their own rows and joins wrapped lines", () => {
    expect(result.questions[0].text).toBe(
      "Consider the following statements:\n1. Genes are made of DNA that is wrapped around histone proteins in the nucleus.\nWhich of the above is correct?",
    );
  });
  it("reads two-column options and an option that wraps", () => {
    expect(result.questions[0].options).toEqual({ A: "1 only", B: "2 only", C: "Both 1 and 2", D: "Neither" });
    expect(result.questions[1].options.B).toBe("Both true but R does not explain A");
    expect(result.questions[1].options.C).toBe("A is true, R is false");
  });
  it("matches answers and centred explanations to the right row", () => {
    expect(result.questions[0].correct).toBe("B");
    expect(result.questions[0].explanation).toBe("Histones are proteins, not the genes themselves, so only statement 2 holds.");
    expect(result.questions[1].correct).toBe("A");
    expect(result.questions[1].explanation).toBe("Mitosis gives two identical daughter cells.");
  });
  it("does not take page footers or the table heading as content", () => {
    expect(JSON.stringify(result.questions)).not.toMatch(/Page \d of|Ans|Explanation"/);
  });
  it("flags what is missing instead of guessing", () => {
    expect(result.questions[2].correct).toBeNull();
    expect(result.questions[2].flags).toContain("No answer was found for this question.");
    expect(result.questions[0].flags).toEqual([]);
  });
  it("is complete only when text, four options and an answer exist", () => {
    expect(isCompleteDraft(result.questions[0])).toBe(true);
    expect(isCompleteDraft(result.questions[2])).toBe(false);
  });
  it("matches the question count on the cover page", () => {
    expect(result.warnings.join(" ")).not.toMatch(/first page says/);
  });
});

describe("answers written under each question", () => {
  const items = [
    ...row(1, 100, [60, "1. What is 2 + 2?"]),
    ...row(1, 120, [60, "(A) 3"], [200, "(B) 4"]),
    ...row(1, 138, [60, "(C) 5"], [200, "(D) 6"]),
    ...row(1, 156, [60, "Answer: B"]),
    ...row(1, 172, [60, "Explanation: Two plus two is four."]),
    ...row(1, 172 + 16, [60, "It is basic addition."]),
    ...row(1, 230, [60, "2. Solve x + 1 = 3"]),
    ...row(1, 250, [60, "(A) 1"], [200, "(B) 2"]),
    ...row(1, 268, [60, "(C) 3"], [200, "(D) 4"]),
    ...row(1, 286, [60, "Ans. (B)"]),
  ];
  const result = parseQuestionPdf(items);
  it("reads numbered questions and inline answers", () => {
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0].text).toBe("What is 2 + 2?");
    expect(result.questions[0].correct).toBe("B");
    expect(result.questions[0].explanation).toBe("Two plus two is four. It is basic addition.");
    expect(result.questions[1].correct).toBe("B");
  });
});

describe("numbered statements are not mistaken for questions", () => {
  const items = [
    ...row(1, 100, [60, "1. Consider these statements:"]),
    ...row(1, 116, [60, "1. Water is wet."]),
    ...row(1, 132, [60, "2. Fire is cold."]),
    ...row(1, 148, [60, "Which is correct?"]),
    ...row(1, 170, [60, "(A) 1 only"], [220, "(B) 2 only"]),
    ...row(1, 188, [60, "(C) Both"], [220, "(D) Neither"]),
    ...row(1, 210, [60, "2. Second question?"]),
    ...row(1, 230, [60, "(A) a"], [220, "(B) b"]),
    ...row(1, 248, [60, "(C) c"], [220, "(D) d"]),
    ...row(1, 300, [60, "Answer Key"]),
    ...row(1, 320, [60, "1. A  2. D"]),
  ];
  const result = parseQuestionPdf(items);
  it("keeps the statements inside question 1", () => {
    expect(result.questions.map((q) => q.number)).toEqual([1, 2]);
    expect(result.questions[0].text).toContain("1. Water is wet.");
    expect(result.questions[0].text).toContain("2. Fire is cold.");
  });
  it("reads a plain list of answers", () => {
    expect(result.questions.map((q) => q.correct)).toEqual(["A", "D"]);
  });
});

describe("whole-file warnings", () => {
  it("says so when nothing can be read", () => {
    const result = parseQuestionPdf(row(1, 100, [60, "Just a picture of a page"]));
    expect(result.questions).toEqual([]);
    expect(result.warnings[0]).toMatch(/No questions were found/);
  });
  it("warns when the count on the cover page does not match", () => {
    const items = [
      ...row(1, 60, [60, "5 Practice Questions"]),
      ...row(1, 100, [60, "Q01"]),
      ...row(1, 120, [60, "What is it?"]),
      ...row(1, 140, [60, "(A) a"], [200, "(B) b"]),
      ...row(1, 158, [60, "(C) c"], [200, "(D) d"]),
      ...row(1, 200, [60, "Q02"]),
      ...row(1, 220, [60, "And this?"]),
      ...row(1, 240, [60, "(A) a"], [200, "(B) b"]),
      ...row(1, 258, [60, "(C) c"], [200, "(D) d"]),
    ];
    const result = parseQuestionPdf(items);
    expect(result.warnings.join(" ")).toMatch(/says 5 questions, but 2 were found/);
    expect(result.warnings.join(" ")).toMatch(/No answer key was found/);
  });
  it("flags a missing option and a question that mentions a figure", () => {
    const items = [
      ...row(1, 100, [60, "Q01"]),
      ...row(1, 120, [60, "In the figure shown below, find the angle."]),
      ...row(1, 140, [60, "(A) 30"], [200, "(B) 60"]),
      ...row(1, 158, [60, "(C) 90"]),
    ];
    const q = parseQuestionPdf(items).questions[0];
    expect(q.flags.join(" ")).toMatch(/Option D was not found/);
    expect(q.flags.join(" ")).toMatch(/picture or diagram/);
  });
});
