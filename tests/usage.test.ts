import { describe, expect, it } from "vitest";
import { blockedMessage, splitDeletable, tally } from "../lib/usage";

describe("usage", () => {
  it("counts rows per id and ignores unknown ids", () => {
    expect(tally([{ chapter_id: "a" }, { chapter_id: "a" }, { chapter_id: "z" }, { chapter_id: null }], "chapter_id", ["a", "b"])).toEqual({ a: 2, b: 0 });
  });
  it("splits free from busy", () => {
    expect(splitDeletable(["a", "b", "c"], { a: 2, b: 0, c: 1 })).toEqual({ free: ["b"], busy: ["a", "c"] });
  });
  it("words the block message", () => {
    expect(blockedMessage("chapter", ["Algebra"])).toMatch(/This chapter still has/);
    expect(blockedMessage("subject", ["A", "B", "C", "D"])).toMatch(/and 1 more/);
  });
});
