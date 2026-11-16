"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toExamSummaries, toRosterStudent, type ExamSummary, type RosterStudent } from "@/lib/adminRoster";

export type RosterState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; students: RosterStudent[]; exams: ExamSummary[]; totalStudents: number };

/** Most rows the roster list loads in one go. The exam totals are exact regardless. */
export const ROSTER_LIMIT = 2000;

/**
 * Real enrolled students, read through two database functions that only approved admins
 * can get rows from (SQL migration 009).
 */
export function useRoster(): { state: RosterState; retry: () => void } {
  const [state, setState] = useState<RosterState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const [rosterResult, examResult] = await Promise.all([
        supabase.rpc("admin_student_roster").limit(ROSTER_LIMIT),
        supabase.rpc("admin_exam_summary"),
      ]);
      if (!active) return;
      const failure = rosterResult.error ?? examResult.error;
      if (failure) {
        setState({
          status: "error",
          message: /function|schema cache|does not exist/i.test(failure.message)
            ? "The roster needs the latest SQL (migration 009). Run it in Supabase, then reload."
            : failure.message,
        });
        return;
      }
      const students = ((rosterResult.data ?? []) as unknown as Record<string, unknown>[])
        .map(toRosterStudent)
        .filter((row): row is RosterStudent => row !== null);
      const exams = toExamSummaries((examResult.data ?? []) as unknown as Record<string, unknown>[]);
      setState({ status: "ready", students, exams, totalStudents: exams.reduce((sum, item) => sum + item.enrolled, 0) });
    })().catch((error: unknown) => {
      if (active) setState({ status: "error", message: error instanceof Error ? error.message : "Network error." });
    });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((count) => count + 1);
  }, []);

  return { state, retry };
}
