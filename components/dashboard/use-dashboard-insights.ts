"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { subjectHref } from "@/lib/subjects";
import { buildInsights, toInsightAttempt, type InsightAttempt, type InsightLog, type Insights } from "./insights";

export interface UpcomingMock {
  id: string;
  title: string;
  exam: string;
  questions: number;
  totalMarks: number;
  minutes: number;
}

export interface SubjectLink {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
}

export interface RecentStudy {
  id: string;
  subject: string;
  minutes: number;
}

export type DashboardInsights =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      insights: Insights;
      upcoming: UpcomingMock[];
      recentStudy: RecentStudy[];
      subjects: SubjectLink[];
    };

/**
 * Everything the dashboard shows beyond the three tiles, read from the cadet's own rows:
 * attempts, study logs, the mock tests they have not taken yet and the active subjects.
 * The clock is read after the data loads so the page can still be prerendered.
 */
export function useDashboardInsights(): DashboardInsights {
  const [state, setState] = useState<DashboardInsights>({ status: "loading" });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return; // the dashboard route already sends signed-out visitors to the login page

      const [attemptResult, logResult, testResult, subjectResult] = await Promise.all([
        supabase
          .from("user_quiz_attempts")
          .select("id, quiz_id, mock_test_id, attempt_kind, score, total_questions, attempted_at, quizzes(title, category), mock_tests(title)")
          .eq("user_id", user.id)
          .order("attempted_at", { ascending: false })
          .limit(500),
        supabase
          .from("study_logs")
          .select("id, subject, minutes_studied, questions_solved, logged_at")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(500),
        supabase
          .from("mock_tests")
          .select("id, title, target_exam, duration_minutes, total_marks, test_questions(count)")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase.from("subjects").select("id, name, slug, description, icon_name").eq("is_active", true).order("sort_order", { ascending: true }),
      ]);
      if (!active) return;

      if (attemptResult.error) {
        setState({ status: "error", message: attemptResult.error.message });
        return;
      }

      const attempts = ((attemptResult.data ?? []) as unknown as Record<string, unknown>[])
        .map(toInsightAttempt)
        .filter((row): row is InsightAttempt => row !== null);
      const logs: InsightLog[] = ((logResult.data ?? []) as unknown as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        subject: typeof row.subject === "string" ? row.subject : "General",
        minutes: Number(row.minutes_studied) || 0,
        questions: Number(row.questions_solved) || 0,
        at: typeof row.logged_at === "string" ? row.logged_at : null,
      }));

      const taken = new Set(attempts.filter((a) => a.kind === "mock").map((a) => a.groupId));
      const upcoming: UpcomingMock[] = ((testResult.data ?? []) as unknown as Record<string, unknown>[])
        .filter((row) => typeof row.id === "string" && !taken.has(row.id))
        .map((row) => {
          const counted = Array.isArray(row.test_questions) ? (row.test_questions[0] as { count?: number } | undefined)?.count : undefined;
          return {
            id: String(row.id),
            title: String(row.title ?? "Mock test"),
            exam: String(row.target_exam ?? ""),
            questions: Number(counted) || 0,
            totalMarks: Number(row.total_marks) || 0,
            minutes: Number(row.duration_minutes) || 0,
          };
        })
        .filter((test) => test.questions > 0)
        .slice(0, 3);

      const subjects: SubjectLink[] = ((subjectResult.data ?? []) as unknown as Record<string, unknown>[]).map((row) => ({
        id: String(row.id),
        name: String(row.name ?? ""),
        description: typeof row.description === "string" ? row.description : "",
        icon: typeof row.icon_name === "string" ? row.icon_name : "book",
        href: subjectHref(String(row.slug ?? "")),
      }));

      setState({
        status: "ready",
        insights: buildInsights(attempts, logs, new Date()),
        upcoming,
        recentStudy: logs.slice(0, 4).map((l) => ({ id: l.id, subject: l.subject, minutes: l.minutes })),
        subjects,
      });
    })().catch((error: unknown) => {
      if (active) setState({ status: "error", message: error instanceof Error ? error.message : "Network error." });
    });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
