"use client";

import { useEffect, useState } from "react";
import { percentOf } from "@/lib/mockScoring";
import { studyStreak } from "@/lib/studyStreak";
import { supabase } from "@/lib/supabaseClient";

export type LiveStats =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      /** Correct answers over all questions in mock tests, as a percentage. Null before the first mock test. */
      mockAccuracy: number | null;
      mockTests: number;
      /** The best single mock test, as a percentage. */
      bestMock: number | null;
      /** Days in a row with a test attempt or a study session. */
      streak: number;
    };

interface AttemptStat {
  score: number;
  total_questions: number;
  attempted_at: string | null;
  attempt_kind?: string | null;
}

/**
 * The cadet's real numbers for the dashboard tiles: Mock Accuracy and Study Streak come from
 * their attempts and study logs, and are read fresh each time the dashboard opens.
 */
export function useLiveStats(): LiveStats {
  const [stats, setStats] = useState<LiveStats>({ status: "loading" });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return; // the dashboard route already sends signed-out visitors to the login page

      let attemptsResult: { data: unknown; error: { message: string } | null } = await supabase
        .from("user_quiz_attempts")
        .select("score, total_questions, attempted_at, attempt_kind")
        .eq("user_id", user.id);
      let kindKnown = true;
      if (attemptsResult.error && /attempt_kind/i.test(attemptsResult.error.message)) {
        // The SQL for mock tests has not been run yet: fall back to the old columns.
        kindKnown = false;
        attemptsResult = await supabase.from("user_quiz_attempts").select("score, total_questions, attempted_at").eq("user_id", user.id);
      }
      const logsResult = await supabase.from("study_logs").select("logged_at").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(400);
      if (!active) return;

      if (attemptsResult.error) {
        setStats({ status: "error", message: attemptsResult.error.message });
        return;
      }

      const attempts = (attemptsResult.data ?? []) as unknown as AttemptStat[];
      const mocks = kindKnown ? attempts.filter((a) => a.attempt_kind === "mock" && a.total_questions > 0) : [];
      const correct = mocks.reduce((sum, a) => sum + a.score, 0);
      const questions = mocks.reduce((sum, a) => sum + a.total_questions, 0);
      const best = mocks.reduce((high, a) => Math.max(high, percentOf(a.score, a.total_questions)), 0);

      const stamps = [
        ...attempts.map((a) => a.attempted_at),
        ...((logsResult.data ?? []) as { logged_at: string | null }[]).map((l) => l.logged_at),
      ];

      setStats({
        status: "ready",
        mockAccuracy: mocks.length > 0 ? percentOf(correct, questions) : null,
        mockTests: mocks.length,
        bestMock: mocks.length > 0 ? best : null,
        // The clock is read here, after the data has loaded, so the page can still be prerendered.
        streak: studyStreak(stamps, new Date()),
      });
    })().catch((error: unknown) => {
      if (active) setStats({ status: "error", message: error instanceof Error ? error.message : "Network error." });
    });
    return () => {
      active = false;
    };
  }, []);

  return stats;
}
