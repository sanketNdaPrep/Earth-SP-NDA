import { describe, expect, it } from "vitest";
import { formatCards, parseCards, shuffled } from "../lib/flashcards";

describe("parseCards", () => {
  it("reads one card per line and skips blanks", () => {
    const r = parseCards("2 + 2 | 4\n\n  Capital of India | New Delhi  ");
    expect(r).toEqual({ ok: true, cards: [{ front: "2 + 2", back: "4" }, { front: "Capital of India", back: "New Delhi" }] });
  });
  it("keeps extra bars inside the answer", () => {
    const r = parseCards("|x| | absolute value");
    expect(r.ok).toBe(false);
    const ok = parseCards("Set notation | A | B means A or B");
    expect(ok).toEqual({ ok: true, cards: [{ front: "Set notation", back: "A | B means A or B" }] });
  });
  it("names the bad line", () => {
    const r = parseCards("a | b\njust a question");
    expect(r).toEqual({ ok: false, error: 'Line 2 needs a question and an answer separated by "|".' });
  });
  it("rejects an empty deck", () => {
    expect(parseCards("  \n ").ok).toBe(false);
  });
  it("round-trips", () => {
    const cards = [{ front: "q1", back: "a1" }, { front: "q2", back: "a2" }];
    expect(parseCards(formatCards(cards))).toEqual({ ok: true, cards });
  });
});

describe("shuffled", () => {
  it("keeps every item and does not change the input", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffled(input);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});
