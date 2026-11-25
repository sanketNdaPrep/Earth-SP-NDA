import { describe, expect, it } from "vitest";
import { PAUSE_KEEP_MS, cleanProgress, pauseExpired, secondsLeft, startedAtOnResume } from "../lib/test-pause";

const ID = "30000000-0000-4000-8000-0000000000c1";

describe("cleanProgress", () => {
  it("keeps good answers, marks, visits and position", () => {
    expect(cleanProgress({ answers: { [ID]: "B" }, marked: [ID], visited: [ID], current: 4 })).toEqual({ answers: { [ID]: "B" }, marked: [ID], visited: [ID], current: 4 });
  });
  it("drops junk", () => {
    const out = cleanProgress({ answers: { [ID]: "Z", nope: "A" }, marked: ["x", 3, ID, ID], visited: "no", current: -2 });
    expect(out).toEqual({ answers: {}, marked: [ID], visited: [], current: 0 });
  });
  it("survives a non-object", () => {
    expect(cleanProgress(null)).toEqual({ answers: {}, marked: [], visited: [], current: 0 });
  });
});

describe("pause clock", () => {
  const limit = 30 * 60 * 1000;
  it("paused time does not count: resuming gives back the same seconds left", () => {
    const started = 1_000_000;
    const pausedAt = started + 10 * 60 * 1000;
    const left = secondsLeft(started, limit, pausedAt);
    expect(left).toBe(20 * 60);
    const resumeAt = pausedAt + 3 * 24 * 60 * 60 * 1000;
    expect(secondsLeft(startedAtOnResume(resumeAt, limit, left), limit, resumeAt)).toBe(20 * 60);
  });
  it("never goes below zero", () => {
    expect(secondsLeft(0, limit, limit * 2)).toBe(0);
  });
  it("expires after the keep time", () => {
    expect(pauseExpired(0, PAUSE_KEEP_MS)).toBe(false);
    expect(pauseExpired(0, PAUSE_KEEP_MS + 1)).toBe(true);
    expect(pauseExpired(Number.NaN, 5)).toBe(true);
  });
});
