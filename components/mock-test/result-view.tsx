"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { getMockResult } from "@/app/quizzes/actions";
import { SpinnerIcon } from "@/components/quiz/icons";
import { QuestionCard } from "@/components/quiz/question-card";
import { QuestionPalette } from "@/components/quiz/question-palette";
import { formatDuration, formatMarks } from "@/components/quiz/scoring";
import { ghostButton, primaryButton } from "@/components/quiz/styles";
import type { PaletteStatus, QuizQuestion } from "@/components/quiz/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ResultData, ResultFetch } from "@/lib/mockEngine";

type Filter = "all" | "correct" | "wrong" | "unanswered";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "correct", label: "Correct" },
  { id: "wrong", label: "Wrong" },
  { id: "unanswered", label: "Not answered" },
];

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

function Stat({ label, value, tone = "text-white" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-md border border-steel-700/60 bg-navy-950 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</dt>
      <dd className={`mt-1 font-mono text-xl font-bold tabular-nums ${tone}`}>{value}</dd>
    </div>
  );
}

function statusOf(item: ResultData["items"][number]): "correct" | "wrong" | "unanswered" {
  if (item.chosen === null) return "unanswered";
  return item.chosen === item.correct ? "correct" : "wrong";
}

function Review({ result }: { result: ResultData }) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [current, setCurrent] = React.useState(0);

  const kinds = result.items.map(statusOf);
  const visible = result.items.map((_, i) => i).filter((i) => filter === "all" || kinds[i] === filter);
  const position = visible.indexOf(current);
  const item = result.items[current];

  const paletteStatuses: PaletteStatus[] = kinds.map((k) => (k === "unanswered" ? "skipped" : k));

  const pickFilter = (next: Filter) => {
    setFilter(next);
    const first = result.items.findIndex((it, i) => next === "all" || kinds[i] === next);
    if (first !== -1) setCurrent(first);
  };

  const q = item?.question;
  const asQuestion: QuizQuestion | null = q
    ? { ...q, correct_option: item.correct, position: current + 1 }
    : null;

  const step = (by: -1 | 1) => {
    const next = visible[position + by];
    if (next !== undefined) setCurrent(next);
  };

  return (
    <section aria-labelledby="review-heading" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="review-heading" className="text-xl font-bold text-white">
          Question review
        </h2>
        <div role="group" aria-label="Filter questions" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f.id === "all" ? result.items.length : kinds.filter((k) => k === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => pickFilter(f.id)}
                aria-pressed={filter === f.id}
                className={
                  filter === f.id
                    ? "inline-flex min-h-11 items-center gap-2 rounded-md border border-gold-400 bg-gold-400/10 px-3 text-sm font-semibold text-gold-300"
                    : "inline-flex min-h-11 items-center gap-2 rounded-md border border-steel-700 px-3 text-sm font-medium text-steel-100 hover:border-steel-500"
                }
              >
                {f.label}
                <span className="tabular-nums text-steel-300">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-steel-300">No questions in this group.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0 space-y-4">
            {asQuestion ? (
              <QuestionCard
                key={asQuestion.id}
                question={asQuestion}
                index={current}
                total={result.items.length}
                selected={item.chosen}
                marked={false}
                mode="review"
                onSelect={() => undefined}
                onClear={() => undefined}
                onToggleMark={() => undefined}
              />
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-steel-300">
                  Question {current + 1} was removed from the question bank after this test. You answered{" "}
                  {item?.chosen ?? "nothing"}; the correct answer was {item?.correct}.
                </CardContent>
              </Card>
            )}
            <div className="flex items-center justify-between gap-3">
              <button type="button" className={ghostButton} onClick={() => step(-1)} disabled={position <= 0}>
                Previous
              </button>
              <span className="text-xs tabular-nums text-steel-300">
                {position + 1} of {visible.length}
              </span>
              <button type="button" className={primaryButton} onClick={() => step(1)} disabled={position === -1 || position >= visible.length - 1}>
                Next
              </button>
            </div>
          </div>

          <aside aria-label="Question palette">
            <div className="rounded-lg border border-steel-700 bg-navy-900 p-5 lg:sticky lg:top-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-steel-300">Question palette</h3>
              <QuestionPalette statuses={paletteStatuses} current={current} review onJump={setCurrent} />
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

/** The result of one finished mock test: score, percentage, and a question-by-question review. */
export function ResultView({ attemptId }: { attemptId: string }) {
  const [state, setState] = React.useState<{ status: "loading" } | { status: "failed"; failure: Extract<ResultFetch, { ok: false }> } | { status: "ready"; result: ResultData }>({ status: "loading" });
  const [tries, setTries] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    getMockResult(attemptId).then(
      (fetched) => {
        if (!active) return;
        setState(fetched.ok ? { status: "ready", result: fetched.result } : { status: "failed", failure: fetched });
      },
      () => {
        if (active) setState({ status: "failed", failure: { ok: false, reason: "error", message: "The result could not be loaded. Check your connection." } });
      },
    );
    return () => {
      active = false;
    };
  }, [attemptId, tries]);

  if (state.status === "loading") {
    return (
      <main className="grid min-h-dvh place-items-center bg-navy-950 text-steel-300" aria-busy="true">
        <p role="status" className="flex items-center gap-2 text-sm">
          <SpinnerIcon className="size-4 animate-spin" />
          Loading your result...
        </p>
      </main>
    );
  }

  if (state.status === "failed") {
    const needsSignIn = state.failure.reason === "auth";
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-4 py-10">
        <div className="rounded-lg border border-steel-700 bg-navy-900 p-6 text-center sm:p-8">
          <h1 className="text-xl font-semibold text-white">{state.failure.reason === "notfound" ? "Result not found" : "The result could not be shown"}</h1>
          <p role="alert" className="mt-3 text-sm text-steel-300">
            {state.failure.message}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {needsSignIn ? (
              <Link href="/login" className={primaryButton}>
                Sign in
              </Link>
            ) : state.failure.reason === "error" ? (
              <button type="button" className={primaryButton} onClick={() => { setState({ status: "loading" }); setTries((n) => n + 1); }}>
                Try again
              </button>
            ) : null}
            <Link href="/quizzes" className={ghostButton}>
              Test Center
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { result } = state;
  const passing = result.passingMarks > 0;
  const passed = passing && result.marks >= result.passingMarks;
  const when = result.attemptedAt ? dateFormat.format(new Date(result.attemptedAt)) : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-navy-950 p-4 text-steel-100 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="flex flex-col gap-4 border-b border-steel-700/60 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold">Result</Badge>
                <Badge variant="outline">{result.exam}</Badge>
              </div>
              <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white">{result.title}</h1>
              {when ? <p className="mt-1 text-sm text-steel-300">Submitted {when}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className={primaryButton}>
                Back to Dashboard
              </Link>
              {result.mockTestId ? (
                <Link href={`/quizzes/${result.mockTestId}`} className={ghostButton}>
                  Retake test
                </Link>
              ) : null}
              <Link href="/quizzes" className={ghostButton}>
                Test Center
              </Link>
            </div>
          </header>

          <section aria-labelledby="score-heading">
            <h2 id="score-heading" className="sr-only">
              Your score
            </h2>
            <Card>
              <CardContent className="grid gap-6 py-6 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:items-center">
                <div className="text-center md:text-left">
                  <p className="font-mono text-6xl font-bold tabular-nums text-gold-300">{result.percentage}%</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {result.score} of {result.total} correct
                  </p>
                  {passing ? (
                    <p className={`mt-3 inline-flex rounded-md border px-3 py-1 text-sm font-semibold ${passed ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-gold-400 bg-gold-400/10 text-gold-300"}`}>
                      {passed ? "Passed" : "Below the pass mark"} ({formatMarks(result.passingMarks)} needed)
                    </p>
                  ) : null}
                </div>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Stat label="Marks" value={`${formatMarks(result.marks)} / ${formatMarks(result.totalMarks)}`} />
                  <Stat label="Time taken" value={formatDuration(result.timeTakenSeconds)} />
                  <Stat label="Correct" value={result.score} tone="text-emerald-300" />
                  <Stat label="Wrong" value={result.wrong} tone="text-gold-300" />
                  <Stat label="Not answered" value={result.unanswered} />
                  <Stat label="Questions" value={result.total} />
                </dl>
              </CardContent>
            </Card>
          </section>

          <Review result={result} />
        </div>
      </div>
    </MotionConfig>
  );
}
