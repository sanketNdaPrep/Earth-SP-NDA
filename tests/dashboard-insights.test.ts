import { describe, expect, it } from "vitest";
import { buildInsights, statusOf, toInsightAttempt, type InsightAttempt, type InsightLog } from "../components/dashboard/insights";

const now = new Date(2026, 10, 15, 12, 0, 0);
const at = (day: number) => new Date(2026, 10, day, 10, 0, 0).toISOString();
const attempt = (over: Partial<InsightAttempt>): InsightAttempt => ({
  id: String(Math.random()), kind: "practice", title: "NDA Maths - Algebra", groupId: "g1", subject: "maths", score: 8, total: 10, at: at(15), ...over,
});

describe("buildInsights", () => {
  it("is empty for a cadet with no activity", () => {
    const out = buildInsights([], [], now);
    expect(out.mockScores).toEqual([]);
    expect(out.rings).toEqual([]);
    expect(out.log).toEqual([]);
    expect(out.overallAccuracy).toBeNull();
    expect(out.averageMock).toBeNull();
    expect(out.streak).toBe(0);
    expect(out.daily).toHaveLength(7);
    expect(out.daily.every((d) => d.count === 0)).toBe(true);
  });

  it("builds the mock trend oldest first with running numbers", () => {
    const out = buildInsights(
      [attempt({ kind: "mock", subject: null, score: 5, total: 10, at: at(10) }), attempt({ kind: "mock", subject: null, score: 9, total: 10, at: at(12) })],
      [],
      now,
    );
    expect(out.mockScores).toEqual([{ label: "Mock 1", score: 50 }, { label: "Mock 2", score: 90 }]);
    expect(out.averageMock).toBe(70);
    expect(out.mockCount).toBe(2);
  });

  it("counts questions per day over the last seven days and ends today", () => {
    const logs: InsightLog[] = [{ id: "l", subject: "Physics", minutes: 90, questions: 5, at: at(15) }];
    const out = buildInsights([attempt({ total: 10, at: at(15) }), attempt({ total: 20, at: at(14) })], logs, now);
    expect(out.daily[6]).toEqual({ label: "Sun", count: 15 });
    expect(out.daily[5].count).toBe(20);
  });

  it("groups repeat attempts of one module and grades it", () => {
    const out = buildInsights([attempt({ score: 5, total: 10 }), attempt({ score: 7, total: 10, at: at(14) })], [], now);
    expect(out.modules).toHaveLength(1);
    expect(out.modules[0]).toMatchObject({ attempts: 2, questions: 20, accuracy: 60, status: "moderate" });
  });

  it("orders the mission log newest first and sums study time", () => {
    const out = buildInsights([attempt({ at: at(13) })], [{ id: "l", subject: "English", minutes: 90, questions: 0, at: at(14) }], now);
    expect(out.log[0].text).toBe("Studied English");
    expect(out.log[0].detail).toBe("1.5 hr");
    expect(out.studyMinutes).toBe(90);
    expect(out.studyMinutesMonth).toBe(90);
  });

  it("ignores attempts with no questions", () => {
    expect(buildInsights([attempt({ total: 0, score: 0 })], [], now).overallAccuracy).toBeNull();
  });
});

describe("statusOf", () => {
  it("grades accuracy", () => {
    expect([statusOf(90), statusOf(75), statusOf(60), statusOf(59.9)]).toEqual(["strong", "strong", "moderate", "weak"]);
  });
});

describe("toInsightAttempt", () => {
  it("reads a mock row with its joined test", () => {
    const row = toInsightAttempt({ id: "a", attempt_kind: "mock", mock_test_id: "m1", score: 3, total_questions: 4, attempted_at: at(1), mock_tests: { title: "Paper 1" } });
    expect(row).toMatchObject({ kind: "mock", title: "Paper 1", groupId: "m1", subject: null, score: 3, total: 4 });
  });
  it("reads a practice row and finds its subject", () => {
    const row = toInsightAttempt({ id: "b", attempt_kind: "practice", quiz_id: "q1", score: 1, total_questions: 2, quizzes: [{ title: "NDA Maths - Algebra", category: "NDA" }] });
    expect(row).toMatchObject({ kind: "practice", groupId: "q1", subject: "maths" });
  });
  it("rejects a row with no id", () => {
    expect(toInsightAttempt({})).toBeNull();
  });
});
