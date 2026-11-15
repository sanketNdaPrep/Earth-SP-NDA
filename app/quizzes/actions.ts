"use server";

import { randomUUID } from "node:crypto";
import type { AttemptDetails, PublicQuestion, ResultFetch, ResultItem, StartResult, SubmitResult } from "@/lib/mockEngine";
import { clampSeconds, isLetter, marksFor, percentOf, scoreSubmission, type KeyEntry, type Letter } from "@/lib/mockScoring";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** A started test that is this much past its time is treated as abandoned, and starts afresh. */
const RESTART_AFTER_MS = 2 * 60 * 1000;
/** A submit later than this after the deadline is refused: the browser auto-submits at zero. */
const LATE_SUBMIT_MS = 5 * 60 * 1000;
const MAX_ANSWERS = 300;

type Failure = { ok: false; reason: "auth" | "missing" | "empty" | "config" | "nosession" | "late" | "error"; message: string };
const fail = (reason: Failure["reason"], message: string): Failure => ({ ok: false, reason, message });

/** The signed-in cadet, found from the session cookie on the server. Never trusts an id sent by the browser. */
async function currentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data?.user ?? null };
}

interface TestRow {
  id: string;
  title: string;
  target_exam: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
}

/**
 * Starts (or resumes) a mock test. Returns the questions WITHOUT the answer key or solutions,
 * and the seconds left, counted from a start time that only the server keeps.
 */
export async function startMockTest(mockTestId: string): Promise<StartResult> {
  if (!UUID.test(mockTestId)) return fail("missing", "That test could not be found.");

  const { supabase, user } = await currentUser();
  if (!user) return fail("auth", "Sign in to take this test.");

  const admin = createSupabaseAdminClient();
  if (!admin) return fail("config", "The test server is not set up yet. Please tell your instructor.");

  // Read with the cadet's own session, so Row Level Security hides drafts.
  const testResult = await supabase
    .from("mock_tests")
    .select("id, title, target_exam, duration_minutes, total_marks, passing_marks")
    .eq("id", mockTestId)
    .maybeSingle();
  if (testResult.error) return fail("error", "The test could not be loaded. Try again in a moment.");
  const test = testResult.data as TestRow | null;
  if (!test) return fail("missing", "That test could not be found. It may have been unpublished.");

  const linkResult = await supabase
    .from("test_questions")
    .select("position, questions(id, question_text, option_a, option_b, option_c, option_d)")
    .eq("mock_test_id", mockTestId)
    .order("position", { ascending: true });
  if (linkResult.error) return fail("error", "The questions could not be loaded. Try again in a moment.");

  const links = (linkResult.data ?? []) as unknown as { questions: PublicQuestion | PublicQuestion[] | null }[];
  const questions: PublicQuestion[] = [];
  for (const link of links) {
    const q = Array.isArray(link.questions) ? link.questions[0] : link.questions;
    if (!q) continue;
    // Pick the fields one by one, so nothing else (an answer key added later) can ride along.
    questions.push({
      id: q.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
    });
  }
  if (questions.length === 0) return fail("empty", "This test has no questions yet.");

  // The clock lives on the server.
  const limitMs = test.duration_minutes * 60 * 1000;
  const now = Date.now();
  const existing = await admin
    .from("mock_test_sessions")
    .select("started_at")
    .eq("user_id", user.id)
    .eq("mock_test_id", mockTestId)
    .maybeSingle();
  if (existing.error) return fail("error", "The test could not be started. Has the latest SQL been run?");

  let startedMs = existing.data ? Date.parse((existing.data as { started_at: string }).started_at) : Number.NaN;
  let resumed = true;
  if (Number.isNaN(startedMs) || now - startedMs > limitMs + RESTART_AFTER_MS) {
    startedMs = now;
    resumed = false;
    const saved = await admin
      .from("mock_test_sessions")
      .upsert({ user_id: user.id, mock_test_id: mockTestId, started_at: new Date(now).toISOString() }, { onConflict: "user_id,mock_test_id" });
    if (saved.error) return fail("error", "The test could not be started. Has the latest SQL been run?");
  }

  return {
    ok: true,
    test: {
      id: test.id,
      title: test.title,
      exam: test.target_exam,
      durationMinutes: test.duration_minutes,
      totalMarks: test.total_marks,
    },
    questions,
    remainingSeconds: Math.max(0, Math.ceil((startedMs + limitMs - now) / 1000)),
    sittingId: String(startedMs),
    resumed,
  };
}

/**
 * Scores a finished test on the server and saves the attempt. The browser sends only the
 * answers it picked; the answer key is read here and never leaves the server.
 */
export async function submitMockTest(mockTestId: string, answers: Record<string, string>): Promise<SubmitResult> {
  if (!UUID.test(mockTestId)) return fail("missing", "That test could not be found.");

  const { user } = await currentUser();
  if (!user) return fail("auth", "Your session ended. Sign in again, then start the test again.");

  const admin = createSupabaseAdminClient();
  if (!admin) return fail("config", "The test server is not set up yet. Please tell your instructor.");

  // Keep only well-formed answers, and not an unreasonable number of them.
  const clean: Record<string, Letter> = {};
  if (typeof answers === "object" && answers !== null) {
    for (const [id, value] of Object.entries(answers).slice(0, MAX_ANSWERS)) {
      if (UUID.test(id) && isLetter(value)) clean[id] = value;
    }
  }

  const sessionResult = await admin
    .from("mock_test_sessions")
    .select("started_at")
    .eq("user_id", user.id)
    .eq("mock_test_id", mockTestId)
    .maybeSingle();
  if (sessionResult.error) return fail("error", "Your answers could not be checked. Try again.");
  if (!sessionResult.data) return fail("nosession", "This test was not started, or it was already submitted.");

  const testResult = await admin
    .from("mock_tests")
    .select("id, title, target_exam, duration_minutes, total_marks, passing_marks")
    .eq("id", mockTestId)
    .maybeSingle();
  const test = testResult.data as TestRow | null;
  if (testResult.error || !test) return fail("missing", "That test no longer exists.");

  const startedMs = Date.parse((sessionResult.data as { started_at: string }).started_at);
  const limitSeconds = test.duration_minutes * 60;
  const elapsedMs = Date.now() - startedMs;
  if (elapsedMs > limitSeconds * 1000 + LATE_SUBMIT_MS) {
    await admin.from("mock_test_sessions").delete().eq("user_id", user.id).eq("mock_test_id", mockTestId);
    return fail("late", "The time limit ended more than five minutes ago, so this attempt cannot be counted. You can start the test again.");
  }

  // The answer key: read here, used here, never returned.
  const linkResult = await admin
    .from("test_questions")
    .select("question_id, position")
    .eq("mock_test_id", mockTestId)
    .order("position", { ascending: true });
  if (linkResult.error) return fail("error", "Your answers could not be checked. Try again.");
  const linkedIds = ((linkResult.data ?? []) as { question_id: string }[]).map((link) => link.question_id);

  const answerResult = linkedIds.length
    ? await admin.from("question_answers").select("question_id, correct_option").in("question_id", linkedIds)
    : { data: [], error: null };
  if (answerResult.error) return fail("error", "Your answers could not be checked. Try again.");
  const letters = new Map(((answerResult.data ?? []) as { question_id: string; correct_option: string | null }[]).map((a) => [a.question_id, a.correct_option]));

  const key: KeyEntry[] = linkedIds.map((id) => {
    const letter = letters.get(id);
    return { id, correct: isLetter(letter) ? letter : null };
  });

  const summary = scoreSubmission(key, clean);
  if (summary.total === 0) return fail("empty", "This test has no scorable questions.");

  const details: AttemptDetails = {
    title: test.title,
    exam: test.target_exam,
    duration_minutes: test.duration_minutes,
    total_marks: test.total_marks,
    passing_marks: test.passing_marks,
    wrong: summary.wrong,
    unanswered: summary.unanswered,
    items: summary.items,
  };

  const attemptId = randomUUID();
  const saved = await admin.from("user_quiz_attempts").insert({
    id: attemptId,
    user_id: user.id,
    quiz_id: null,
    attempt_kind: "mock",
    mock_test_id: mockTestId,
    score: summary.correct,
    total_questions: summary.total,
    time_taken_seconds: clampSeconds(elapsedMs, limitSeconds),
    details,
  });
  if (saved.error) return fail("error", "Your attempt could not be saved. Has the latest SQL been run? Your answers are still on this screen.");

  // The sitting is over. Taking the test again starts a new one.
  await admin.from("mock_test_sessions").delete().eq("user_id", user.id).eq("mock_test_id", mockTestId);
  return { ok: true, attemptId };
}

/** The result of one finished attempt, with correct answers and solutions. Only its owner can read it. */
export async function getMockResult(attemptId: string): Promise<ResultFetch> {
  if (!UUID.test(attemptId)) return { ok: false, reason: "notfound", message: "That result could not be found." };

  const { user } = await currentUser();
  if (!user) return { ok: false, reason: "auth", message: "Sign in to see your result." };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, reason: "config", message: "The test server is not set up yet." };

  const attemptResult = await admin
    .from("user_quiz_attempts")
    .select("id, score, total_questions, attempted_at, time_taken_seconds, mock_test_id, details")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .eq("attempt_kind", "mock")
    .maybeSingle();
  if (attemptResult.error) return { ok: false, reason: "error", message: "The result could not be loaded." };
  const attempt = attemptResult.data as {
    id: string;
    score: number;
    total_questions: number;
    attempted_at: string | null;
    time_taken_seconds: number | null;
    mock_test_id: string | null;
    details: AttemptDetails | null;
  } | null;
  if (!attempt || !attempt.details) return { ok: false, reason: "notfound", message: "That result could not be found." };

  const details = attempt.details;
  const ids = details.items.map((item) => item.question_id);
  const questionResult = ids.length
    ? await admin.from("questions").select("id, question_text, option_a, option_b, option_c, option_d").in("id", ids)
    : { data: [], error: null };
  if (questionResult.error) return { ok: false, reason: "error", message: "The questions could not be loaded." };
  const solutionResult = ids.length
    ? await admin.from("question_answers").select("question_id, explanation").in("question_id", ids)
    : { data: [], error: null };
  if (solutionResult.error) return { ok: false, reason: "error", message: "The solutions could not be loaded." };
  const solutions = new Map(((solutionResult.data ?? []) as { question_id: string; explanation: string | null }[]).map((a) => [a.question_id, a.explanation]));

  const byId = new Map(
    ((questionResult.data ?? []) as Omit<NonNullable<ResultItem["question"]>, "explanation">[]).map((q) => [
      q.id,
      { ...q, explanation: solutions.get(q.id) ?? null } as NonNullable<ResultItem["question"]>,
    ]),
  );
  const items: ResultItem[] = details.items.map((item) => ({
    question: byId.get(item.question_id) ?? null,
    chosen: item.chosen,
    correct: item.correct,
  }));

  return {
    ok: true,
    result: {
      attemptId: attempt.id,
      mockTestId: attempt.mock_test_id,
      title: details.title,
      exam: details.exam,
      attemptedAt: attempt.attempted_at,
      timeTakenSeconds: attempt.time_taken_seconds ?? 0,
      score: attempt.score,
      total: attempt.total_questions,
      wrong: details.wrong,
      unanswered: details.unanswered,
      percentage: percentOf(attempt.score, attempt.total_questions),
      marks: marksFor(attempt.score, attempt.total_questions, details.total_marks),
      totalMarks: details.total_marks,
      passingMarks: details.passing_marks,
      items,
    },
  };
}
