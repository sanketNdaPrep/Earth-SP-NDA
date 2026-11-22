"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { startMockTest, submitMockTest } from "@/app/quizzes/actions";
import { BriefingScreen } from "@/components/quiz/briefing-screen";
import { Dialog } from "@/components/quiz/dialog";
import { AlertIcon, ChevronLeftIcon, ChevronRightIcon, GridIcon, SpinnerIcon } from "@/components/quiz/icons";
import { QuestionCard } from "@/components/quiz/question-card";
import { QuestionPalette } from "@/components/quiz/question-palette";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { ConfirmSubmitDialog, type SubmitCounts } from "@/components/quiz/submit-dialog";
import { ghostButton, primaryButton } from "@/components/quiz/styles";
import { OPTION_LETTERS, type MarkingScheme, type OptionLetter, type PaletteStatus, type QuizQuestion, type QuizRecord } from "@/components/quiz/types";
import { useCountdown } from "@/components/quiz/use-countdown";
import type { PublicQuestion, PublicTest } from "@/lib/mockEngine";
import { KIND_SHORT, MOCK_COLUMNS, type MockTestRow } from "@/lib/mockTests";
import { supabase } from "@/lib/supabaseClient";

type Phase = "checking" | "auth" | "missing" | "briefing" | "starting" | "running" | "submitting";

interface Saved {
  answers: Record<string, OptionLetter>;
  marked: Record<string, true>;
  visited: Record<string, true>;
  current: number;
}

const storageKey = (testId: string, sittingId: string) => `earth-mock:${testId}:${sittingId}`;

function readSaved(key: string): Saved | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function storageWorks(): boolean {
  try {
    window.localStorage.setItem("earth-mock:probe", "1");
    window.localStorage.removeItem("earth-mock:probe");
    return true;
  } catch {
    return false;
  }
}

function toQuizQuestion(q: PublicQuestion, index: number): QuizQuestion {
  // The answer key and the solution are not known here. They arrive only on the result page.
  return { ...q, correct_option: null, explanation: null, position: index + 1 };
}

function Notice({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-10">
      <div className="rounded-lg border border-steel-700 bg-navy-900 p-6 text-center sm:p-8">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <div className="mt-3 text-sm leading-relaxed text-steel-300">{children}</div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{action}</div>
      </div>
    </main>
  );
}

/** The test-taking screen for one mock test: briefing, timed questions, then server-side scoring. */
export function TestRunner({ testId }: { testId: string }) {
  const router = useRouter();
  const [phase, setPhase] = React.useState<Phase>("checking");
  const [row, setRow] = React.useState<MockTestRow | null>(null);
  const [startError, setStartError] = React.useState<string | null>(null);
  const [storageOk, setStorageOk] = React.useState(true);

  const [test, setTest] = React.useState<PublicTest | null>(null);
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [sittingId, setSittingId] = React.useState("");
  const [endsAt, setEndsAt] = React.useState<number | null>(null);
  const [restored, setRestored] = React.useState(false);

  const [answers, setAnswers] = React.useState<Record<string, OptionLetter>>({});
  const [marked, setMarked] = React.useState<Record<string, true>>({});
  const [visited, setVisited] = React.useState<Record<string, true>>({});
  const [current, setCurrent] = React.useState(0);

  const [dialog, setDialog] = React.useState<"none" | "confirm" | "palette">("none");
  const [submitFailure, setSubmitFailure] = React.useState<{ message: string; retry: boolean } | null>(null);
  const submitting = React.useRef(false);

  // The briefing: the public details of the test, and whether the cadet is signed in.
  React.useEffect(() => {
    let active = true;
    (async () => {
      setStorageOk(storageWorks());
      const { data: auth } = await supabase.auth.getUser();
      const result = await supabase.from("mock_tests").select(MOCK_COLUMNS).eq("id", testId).eq("is_published", true).maybeSingle();
      if (!active) return;
      if (!result.data) {
        setPhase("missing");
        return;
      }
      setRow(result.data as unknown as MockTestRow);
      setPhase(auth?.user ? "briefing" : "auth");
    })();
    return () => {
      active = false;
    };
  }, [testId]);

  const total = questions.length;
  const last = total - 1;
  const question = questions[current];
  const running = phase === "running";

  // Save progress in this browser, so an accidental reload brings the cadet back to the same place.
  React.useEffect(() => {
    if (!running || !sittingId) return;
    try {
      window.localStorage.setItem(storageKey(testId, sittingId), JSON.stringify({ answers, marked, visited, current } satisfies Saved));
    } catch {
      // Storage is a convenience. The test still works without it.
    }
  }, [running, testId, sittingId, answers, marked, visited, current]);

  const finalize = React.useCallback(async () => {
    if (submitting.current) return;
    submitting.current = true;
    setDialog("none");
    setSubmitFailure(null);
    setPhase("submitting");
    const result = await submitMockTest(testId, answers);
    if (result.ok) {
      try {
        window.localStorage.removeItem(storageKey(testId, sittingId));
      } catch {
        // Nothing to clean up.
      }
      router.push(`/quizzes/${testId}/result/${result.attemptId}`);
      return;
    }
    submitting.current = false;
    setSubmitFailure({ message: result.message, retry: result.reason === "error" });
    setPhase("running");
  }, [testId, sittingId, answers, router]);

  const remaining = useCountdown(endsAt, running, () => void finalize());

  const begin = async () => {
    setPhase("starting");
    setStartError(null);
    const result = await startMockTest(testId);
    if (!result.ok) {
      if (result.reason === "auth") setPhase("auth");
      else {
        setStartError(result.message);
        setPhase("briefing");
      }
      return;
    }
    const list = result.questions.map(toQuizQuestion);
    const saved = result.resumed ? readSaved(storageKey(testId, result.sittingId)) : null;
    const known = new Set(list.map((q) => q.id));
    const keepAnswers = Object.fromEntries(Object.entries(saved?.answers ?? {}).filter(([id]) => known.has(id)));
    const startIndex = saved && saved.current >= 0 && saved.current < list.length ? saved.current : 0;

    setTest(result.test);
    setQuestions(list);
    setSittingId(result.sittingId);
    setAnswers(keepAnswers);
    setMarked(saved?.marked ?? {});
    setVisited({ ...(saved?.visited ?? {}), [list[startIndex].id]: true });
    setCurrent(startIndex);
    setRestored(Boolean(saved) && result.resumed);
    setEndsAt(Date.now() + result.remainingSeconds * 1000);
    setPhase("running");
  };

  const goTo = React.useCallback(
    (index: number) => {
      const target = questions[index];
      if (!target) return;
      setCurrent(index);
      setVisited((v) => ({ ...v, [target.id]: true }));
      window.scrollTo({ top: 0 });
    },
    [questions],
  );

  const select = React.useCallback(
    (letter: OptionLetter) => {
      if (!running || !question) return;
      setAnswers((a) => ({ ...a, [question.id]: letter }));
    },
    [running, question],
  );

  const toggleMark = React.useCallback(() => {
    if (!question) return;
    setMarked((m) => {
      const next = { ...m };
      if (next[question.id]) delete next[question.id];
      else next[question.id] = true;
      return next;
    });
  }, [question]);

  // Ask the browser to confirm before a reload or close while the test is running.
  React.useEffect(() => {
    if (!running) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [running]);

  // Keyboard: A to D or 1 to 4 choose, N next, P previous, M mark for review.
  React.useEffect(() => {
    if (!running || dialog !== "none" || submitFailure) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const key = event.key.toLowerCase();
      const letterIndex = "abcd".indexOf(key) !== -1 ? "abcd".indexOf(key) : "1234".indexOf(key);
      if (key.length === 1 && letterIndex !== -1) select(OPTION_LETTERS[letterIndex]);
      else if (key === "n" && current < last) goTo(current + 1);
      else if (key === "p" && current > 0) goTo(current - 1);
      else if (key === "m") toggleMark();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, dialog, submitFailure, select, goTo, toggleMark, current, last]);

  const statuses: PaletteStatus[] = questions.map((q) => {
    const a = Boolean(answers[q.id]);
    const m = Boolean(marked[q.id]);
    if (a && m) return "answered-marked";
    if (a) return "answered";
    if (m) return "marked";
    return visited[q.id] ? "unanswered" : "unvisited";
  });

  const counts: SubmitCounts = {
    total,
    answered: questions.filter((q) => answers[q.id]).length,
    unanswered: questions.filter((q) => !answers[q.id] && visited[q.id]).length,
    unvisited: questions.filter((q) => !answers[q.id] && !visited[q.id]).length,
    marked: Object.keys(marked).length,
  };

  // ---------------------------------------------------------------- screens

  if (phase === "checking") {
    return (
      <main className="grid min-h-dvh place-items-center bg-navy-950 text-steel-300" aria-busy="true">
        <p role="status" className="flex items-center gap-2 text-sm">
          <SpinnerIcon className="size-4 animate-spin" />
          Loading the test...
        </p>
      </main>
    );
  }

  if (phase === "missing") {
    return (
      <Notice
        title="Test not found"
        action={
          <Link href="/quizzes" className={primaryButton}>
            Back to the Test Center
          </Link>
        }
      >
        This test does not exist, or it has not been published yet.
      </Notice>
    );
  }

  if (phase === "auth") {
    return (
      <Notice
        title="Sign in to take this test"
        action={
          <>
            <Link href="/login" className={primaryButton}>
              Sign in
            </Link>
            <Link href="/quizzes" className={ghostButton}>
              Back to the Test Center
            </Link>
          </>
        }
      >
        Your score and progress are saved to your cadet account, so you need to be signed in first.
      </Notice>
    );
  }

  if ((phase === "briefing" || phase === "starting") && row) {
    const quiz: QuizRecord = { id: row.id, title: row.title, category: row.target_exam, description: null, time_limit_mins: row.duration_minutes };
    const scheme: MarkingScheme = { id: "practice", label: KIND_SHORT[row.kind] ?? row.target_exam, correct: Number(row.marks_per_correct), wrong: Number(row.negative_marks) };
    return (
      <MotionConfig reducedMotion="user">
        {startError ? (
          <div role="alert" className="border-b border-gold-400/40 bg-gold-400/10 px-4 py-3 text-center text-sm text-gold-300">
            {startError}
          </div>
        ) : null}
        <BriefingScreen
          quiz={quiz}
          scheme={scheme}
          questionCount={row.total_questions}
          limitSecs={row.duration_minutes * 60}
          storageOk={storageOk}
          onBegin={() => void begin()}
        />
        {phase === "starting" ? (
          <p role="status" className="sr-only">
            Starting the test
          </p>
        ) : null}
      </MotionConfig>
    );
  }

  if (!test || !question) return null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col bg-navy-950 text-steel-100">
        <header className="sticky top-0 z-20 border-b border-steel-700/60 bg-navy-950/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 lg:px-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-gold-400/50 bg-gold-400/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-gold-300">
                  Mock test
                </span>
                <span className="text-xs text-steel-300">{test.exam}</span>
              </div>
              <h1 className="mt-1 truncate text-base font-semibold text-white sm:text-lg">{test.title}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <QuizTimer remaining={remaining} untimed={false} />
              <button type="button" onClick={() => setDialog("confirm")} className={primaryButton} disabled={phase === "submitting"}>
                Submit test
              </button>
            </div>
          </div>
        </header>

        {restored ? (
          <div role="status" className="border-b border-emerald-400/30 bg-emerald-400/10">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm text-emerald-200 lg:px-6">
              <p>Welcome back. Your answers and timer were restored after the reload.</p>
              <button type="button" onClick={() => setRestored(false)} className="min-h-11 touch-manipulation px-2 font-semibold underline underline-offset-4">
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {!storageOk ? (
          <div role="alert" className="border-b border-gold-400/40 bg-gold-400/10">
            <p className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-2 text-sm text-gold-300 lg:px-6">
              <AlertIcon className="size-4 shrink-0" />
              This browser is blocking site storage, so answers are not auto-saved. Do not reload the page.
            </p>
          </div>
        ) : null}

        <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:px-6">
          <main className="min-w-0">
            <p role="status" className="sr-only">
              Question {current + 1} of {total}
            </p>
            <QuestionCard
              key={question.id}
              question={question}
              index={current}
              total={total}
              selected={answers[question.id] ?? null}
              marked={Boolean(marked[question.id])}
              mode="exam"
              onSelect={select}
              onClear={() =>
                setAnswers((a) => {
                  const next = { ...a };
                  delete next[question.id];
                  return next;
                })
              }
              onToggleMark={toggleMark}
            />
            <p className="mt-4 hidden text-sm text-steel-300 lg:block">
              Shortcuts: A to D choose an answer, N next, P previous, M mark for review.
            </p>
          </main>

          <aside aria-label="Question palette" className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-steel-700 bg-navy-900 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-steel-300">Question palette</h2>
              <div className="max-h-[calc(100dvh-16rem)] overflow-y-auto pr-1">
                <QuestionPalette statuses={statuses} current={current} review={false} onJump={goTo} />
              </div>
            </div>
          </aside>
        </div>

        <nav aria-label="Question navigation" className="sticky bottom-0 z-10 border-t border-steel-700/60 bg-navy-950/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <button type="button" onClick={() => goTo(current - 1)} disabled={current === 0} className={ghostButton}>
              <ChevronLeftIcon className="size-4" />
              Previous
            </button>
            <button type="button" onClick={() => setDialog("palette")} className={`${ghostButton} lg:hidden`}>
              <GridIcon className="size-4" />
              <span className="tabular-nums">
                {counts.answered}/{counts.total}
              </span>
              <span className="sr-only">Open question palette</span>
            </button>
            {current < last ? (
              <button type="button" onClick={() => goTo(current + 1)} className={primaryButton}>
                Save and next
                <ChevronRightIcon className="size-4" />
              </button>
            ) : (
              <button type="button" onClick={() => setDialog("confirm")} className={primaryButton}>
                Review and submit
              </button>
            )}
          </div>
        </nav>

        {dialog === "palette" ? (
          <Dialog labelledBy="palette-title" variant="sheet" onClose={() => setDialog("none")}>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="palette-title" className="text-base font-semibold text-white">
                  Question palette
                </h2>
                <button type="button" onClick={() => setDialog("none")} className={ghostButton}>
                  Close
                </button>
              </div>
              <QuestionPalette
                statuses={statuses}
                current={current}
                review={false}
                onJump={(i) => {
                  goTo(i);
                  setDialog("none");
                }}
              />
              <button type="button" onClick={() => setDialog("confirm")} className={`${primaryButton} mt-5 w-full`}>
                Submit test
              </button>
            </div>
          </Dialog>
        ) : null}

        {dialog === "confirm" ? (
          <ConfirmSubmitDialog counts={counts} remaining={remaining} onConfirm={() => void finalize()} onCancel={() => setDialog("none")} />
        ) : null}

        {submitFailure ? (
          <Dialog labelledBy="submit-failed-title" onClose={() => (submitFailure.retry ? setSubmitFailure(null) : router.push("/quizzes"))}>
            <div className="p-6 sm:p-8">
              <h2 id="submit-failed-title" className="text-xl font-semibold text-white">
                Your test was not submitted
              </h2>
              <p role="alert" className="mt-2 text-sm leading-relaxed text-gold-300">
                {submitFailure.message}
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                {submitFailure.retry ? (
                  <button type="button" onClick={() => void finalize()} className={primaryButton}>
                    Try again
                  </button>
                ) : (
                  <Link href="/quizzes" className={primaryButton}>
                    Back to the Test Center
                  </Link>
                )}
              </div>
            </div>
          </Dialog>
        ) : null}

        {phase === "submitting" ? (
          <div role="status" className="fixed inset-0 z-50 grid place-items-center bg-navy-950/90 text-white">
            <p className="flex items-center gap-3 text-base font-semibold">
              <SpinnerIcon className="size-5 animate-spin" />
              Submitting and scoring your test...
            </p>
          </div>
        ) : null}
      </div>
    </MotionConfig>
  );
}
