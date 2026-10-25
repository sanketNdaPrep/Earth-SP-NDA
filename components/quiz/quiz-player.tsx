'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { BriefingScreen } from './briefing-screen';
import { Dialog } from './dialog';
import { AlertIcon, ChevronLeftIcon, ChevronRightIcon, CollapseIcon, ExpandIcon, GridIcon, SpinnerIcon } from './icons';
import { QuestionCard } from './question-card';
import { QuestionPalette } from './question-palette';
import { QuizTimer } from './quiz-timer';
import { resolveMarkingScheme, scoreAttempt } from './scoring';
import { focusRing, ghostButton, goldButton, primaryButton } from './styles';
import { ConfirmSubmitDialog, ResultDialog, type SubmitCounts } from './submit-dialog';
import {
  OPTION_LETTERS,
  type LogState,
  type OptionLetter,
  type PaletteStatus,
  type QuizQuestion,
  type QuizRecord,
} from './types';
import { useCountdown } from './use-countdown';
import { useQuizSession } from './use-quiz-session';

// ------------------------------------------------------------------ loading

type LoadResult =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'missing' }
  | { status: 'empty'; quiz: QuizRecord }
  | { status: 'ready'; quiz: QuizRecord; questions: QuizQuestion[]; userKey: string };

function toQuestion(row: Record<string, unknown>): QuizQuestion {
  const letter = String(row.correct_option ?? '').trim().toUpperCase();
  const text = (value: unknown) => (value === null || value === undefined ? '' : String(value));
  return {
    id: String(row.id),
    question_text: text(row.question_text),
    option_a: text(row.option_a),
    option_b: text(row.option_b),
    option_c: text(row.option_c),
    option_d: text(row.option_d),
    correct_option: (OPTION_LETTERS as readonly string[]).includes(letter) ? (letter as OptionLetter) : null,
    explanation: typeof row.explanation === 'string' && row.explanation.trim() ? row.explanation : null,
    position: typeof row.position === 'number' ? row.position : null,
  };
}

/** Questions come back in the order the seeding page numbered them. */
function sortByPosition(questions: QuizQuestion[]): QuizQuestion[] {
  return questions
    .map((question, order) => ({ question, order }))
    .sort((a, b) => {
      const pa = a.question.position ?? Number.MAX_SAFE_INTEGER;
      const pb = b.question.position ?? Number.MAX_SAFE_INTEGER;
      return pa - pb || a.order - b.order;
    })
    .map((item) => item.question);
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-navy-950 px-4 py-10 text-center text-steel-100">
      {children}
    </main>
  );
}

export function QuizPlayerFallback() {
  return (
    <Screen>
      <p role="status" className="flex items-center gap-3 text-sm text-steel-300">
        <SpinnerIcon className="size-5 text-emerald-400" />
        Loading examination module...
      </p>
    </Screen>
  );
}

export function QuizPlayer() {
  const params = useParams<{ id: string }>();
  const quizId = params?.id;
  const [load, setLoad] = useState<LoadResult>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!quizId) return;
    let cancelled = false;

    Promise.all([
      supabase.from('quizzes').select('*').eq('id', quizId).single(),
      supabase.from('questions').select('*').eq('quiz_id', quizId),
      supabase.auth.getUser(),
    ]).then(
      ([quizResult, questionResult, userResult]) => {
        if (cancelled) return;

        if (quizResult.error || !quizResult.data) {
          // PGRST116: no row matched the id.
          setLoad(
            quizResult.error && quizResult.error.code !== 'PGRST116'
              ? { status: 'error', message: quizResult.error.message }
              : { status: 'missing' },
          );
          return;
        }
        if (questionResult.error) {
          setLoad({ status: 'error', message: questionResult.error.message });
          return;
        }

        const row = quizResult.data as Record<string, unknown>;
        const quiz: QuizRecord = {
          id: String(row.id),
          title: String(row.title ?? 'Practice test'),
          category: String(row.category ?? 'General'),
          description: typeof row.description === 'string' ? row.description : null,
          time_limit_mins: typeof row.time_limit_mins === 'number' ? row.time_limit_mins : null,
        };
        const questions = sortByPosition((questionResult.data ?? []).map((item) => toQuestion(item)));

        setLoad(
          questions.length === 0
            ? { status: 'empty', quiz }
            : { status: 'ready', quiz, questions, userKey: userResult.data?.user?.id ?? 'guest' },
        );
      },
      (error: unknown) => {
        if (!cancelled) setLoad({ status: 'error', message: error instanceof Error ? error.message : 'Network error.' });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [quizId, attempt]);

  if (load.status === 'loading') return <QuizPlayerFallback />;

  if (load.status === 'error') {
    return (
      <Screen>
        <AlertIcon className="size-8 text-gold-400" />
        <h1 className="mt-4 text-xl font-semibold text-white">The test could not be loaded</h1>
        <p role="alert" className="mt-2 max-w-md text-sm leading-relaxed text-steel-300">
          {load.message}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setLoad({ status: 'loading' });
              setAttempt((count) => count + 1);
            }}
            className={primaryButton}
          >
            Try again
          </button>
          <Link href="/quizzes" className={ghostButton}>
            Back to modules
          </Link>
        </div>
      </Screen>
    );
  }

  if (load.status === 'missing' || load.status === 'empty') {
    return (
      <Screen>
        <h1 className="text-xl font-semibold text-white">
          {load.status === 'missing' ? 'This module does not exist' : 'No questions in this module yet'}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-steel-300">
          {load.status === 'missing'
            ? 'The link may be old. Pick a module from the list.'
            : `${load.quiz.title} has no questions seeded. Check back soon.`}
        </p>
        <Link href="/quizzes" className={`${primaryButton} mt-6`}>
          Back to modules
        </Link>
      </Screen>
    );
  }

  return <QuizRunner key={load.quiz.id} quiz={load.quiz} questions={load.questions} userKey={load.userKey} />;
}

// ------------------------------------------------------------------- runner

type DialogState = 'none' | 'confirm' | 'result' | 'palette';

function QuizRunner({ quiz, questions, userKey }: { quiz: QuizRecord; questions: QuizQuestion[]; userKey: string }) {
  const scheme = useMemo(() => resolveMarkingScheme(quiz), [quiz]);
  const questionIds = useMemo(() => questions.map((question) => question.id), [questions]);
  const limitSecs = quiz.time_limit_mins && quiz.time_limit_mins > 0 ? Math.round(quiz.time_limit_mins * 60) : null;

  const { state, dispatch } = useQuizSession(userKey, quiz.id, questionIds);
  const [dialog, setDialog] = useState<DialogState>('none');
  const [log, setLog] = useState<LogState>({ status: 'idle' });
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen] = useState(() => typeof document !== 'undefined' && document.fullscreenEnabled);

  const running = state.phase === 'running';
  const review = state.phase === 'submitted';
  const last = questions.length - 1;
  const current = state.current;
  const question = questions[current];

  // --------------------------------------------------------- derived values

  const statuses = useMemo<PaletteStatus[]>(
    () =>
      questions.map((item) => {
        const picked = state.answers[item.id];
        if (review) {
          if (!picked || !item.correct_option) return 'skipped';
          return picked === item.correct_option ? 'correct' : 'wrong';
        }
        const marked = Boolean(state.marked[item.id]);
        if (picked && marked) return 'answered-marked';
        if (marked) return 'marked';
        if (picked) return 'answered';
        return state.visited[item.id] ? 'unanswered' : 'unvisited';
      }),
    [questions, state.answers, state.marked, state.visited, review],
  );

  const counts = useMemo<SubmitCounts>(() => {
    const answered = statuses.filter((status) => status === 'answered' || status === 'answered-marked').length;
    const unvisited = statuses.filter((status) => status === 'unvisited').length;
    return {
      total: questions.length,
      answered,
      unvisited,
      unanswered: questions.length - answered - unvisited,
      marked: statuses.filter((status) => status === 'marked' || status === 'answered-marked').length,
    };
  }, [statuses, questions.length]);

  const result = useMemo(() => {
    if (!review || state.startedAt === null || state.finishedAt === null) return null;
    // A deadline that passed while the tab was closed is counted at the deadline, not at the late submit.
    const end = state.endsAt === null ? state.finishedAt : Math.min(state.finishedAt, state.endsAt);
    return scoreAttempt(questions, state.answers, scheme, Math.max(0, Math.round((end - state.startedAt) / 1000)));
  }, [review, questions, state.answers, state.startedAt, state.finishedAt, state.endsAt, scheme]);

  // ----------------------------------------------------------- attempt log

  /** Same table and columns the old runner wrote: user_id, quiz_id, score (correct answers), total_questions. */
  const logAttempt = useCallback(
    async (correct: number) => {
      setLog({ status: 'saving' });
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setLog({ status: 'guest' });
        return;
      }
      const { error: insertError } = await supabase.from('user_quiz_attempts').insert({
        user_id: data.user.id,
        quiz_id: quiz.id,
        score: correct,
        total_questions: questions.length,
      });
      setLog(insertError ? { status: 'error', message: insertError.message } : { status: 'saved' });
    },
    [quiz.id, questions.length],
  );

  const finalize = useCallback(() => {
    if (state.phase !== 'running' || state.startedAt === null) return;
    const now = Date.now();
    const end = state.endsAt === null ? now : Math.min(now, state.endsAt);
    const final = scoreAttempt(questions, state.answers, scheme, Math.max(0, Math.round((end - state.startedAt) / 1000)));
    dispatch({ type: 'submit', now });
    setDialog('result');
    void logAttempt(final.correct);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
  }, [state.phase, state.startedAt, state.endsAt, state.answers, questions, scheme, dispatch, logAttempt]);

  const remaining = useCountdown(state.endsAt, running, finalize);

  // --------------------------------------------------------------- actions

  const goTo = useCallback(
    (index: number) => {
      const target = questions[index];
      if (!target) return;
      dispatch({ type: 'go', index, id: target.id });
      window.scrollTo({ top: 0 });
    },
    [questions, dispatch],
  );

  const select = useCallback(
    (letter: OptionLetter) => {
      if (running && question) dispatch({ type: 'select', id: question.id, letter });
    },
    [running, question, dispatch],
  );

  const begin = () => {
    dispatch({ type: 'begin', now: Date.now(), limitSecs, firstId: questions[0].id });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else void document.documentElement.requestFullscreen().catch(() => undefined);
  };

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Ask the browser to confirm before a reload or close while the test is running.
  useEffect(() => {
    if (!running) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [running]);

  // Keyboard: A to D or 1 to 4 choose, N next, P previous, M mark for review.
  useEffect(() => {
    if (!running || dialog !== 'none') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const key = event.key.toLowerCase();
      const letterIndex = 'abcd'.indexOf(key) !== -1 ? 'abcd'.indexOf(key) : '1234'.indexOf(key);
      if (key.length === 1 && letterIndex !== -1) {
        select(OPTION_LETTERS[letterIndex]);
      } else if (key === 'n' && current < last) {
        goTo(current + 1);
      } else if (key === 'p' && current > 0) {
        goTo(current - 1);
      } else if (key === 'm' && question) {
        dispatch({ type: 'mark', id: question.id });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, dialog, select, goTo, dispatch, current, last, question]);

  // ---------------------------------------------------------------- screens

  if (state.phase === 'briefing') {
    return (
      <MotionConfig reducedMotion="user">
        <BriefingScreen
          quiz={quiz}
          scheme={scheme}
          questionCount={questions.length}
          limitSecs={limitSecs}
          storageOk={state.storageOk}
          onBegin={begin}
        />
      </MotionConfig>
    );
  }

  const jump = (index: number) => {
    goTo(index);
    setDialog('none');
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col bg-navy-950 text-steel-100">
        <header className="sticky top-0 z-20 border-b border-steel-700/60 bg-navy-950/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 lg:px-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-gold-400/50 bg-gold-400/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-gold-300">
                  {review ? 'Review' : `${scheme.label} mode`}
                </span>
                <span className="text-xs text-steel-300">{quiz.category}</span>
              </div>
              <h1 className="mt-1 truncate text-base font-semibold text-white sm:text-lg">{quiz.title}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {review ? (
                <>
                  <button type="button" onClick={() => setDialog('result')} className={ghostButton}>
                    View score
                  </button>
                  <Link href="/dashboard" className={primaryButton}>
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <QuizTimer remaining={remaining} untimed={limitSecs === null} />
                  {canFullscreen ? (
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label={fullscreen ? 'Leave full screen' : 'Enter full screen'}
                      className={`${ghostButton} hidden px-3 sm:inline-flex`}
                    >
                      {fullscreen ? <CollapseIcon className="size-5" /> : <ExpandIcon className="size-5" />}
                    </button>
                  ) : null}
                  <button type="button" onClick={() => setDialog('confirm')} className={primaryButton}>
                    Submit test
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {running && state.restored ? (
          <div role="status" className="border-b border-emerald-400/30 bg-emerald-400/10">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm text-emerald-200 lg:px-6">
              <p>Welcome back. Your answers and timer were restored after the reload.</p>
              <button
                type="button"
                onClick={() => dispatch({ type: 'dismiss-restored' })}
                className={`min-h-11 touch-manipulation px-2 font-semibold underline underline-offset-4 ${focusRing}`}
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {running && !state.storageOk ? (
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
              Question {state.current + 1} of {questions.length}
            </p>
            <QuestionCard
              key={question.id}
              question={question}
              index={state.current}
              total={questions.length}
              selected={state.answers[question.id] ?? null}
              marked={Boolean(state.marked[question.id])}
              mode={review ? 'review' : 'exam'}
              onSelect={select}
              onClear={() => dispatch({ type: 'clear', id: question.id })}
              onToggleMark={() => dispatch({ type: 'mark', id: question.id })}
            />
            {running ? (
              <p className="mt-4 hidden text-sm text-steel-300 lg:block">
                Shortcuts: A to D choose an answer, N next, P previous, M mark for review.
              </p>
            ) : null}
          </main>

          <aside aria-label="Question palette" className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-steel-700 bg-navy-900 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-steel-300">Question palette</h2>
              <div className="max-h-[calc(100dvh-16rem)] overflow-y-auto pr-1">
                <QuestionPalette statuses={statuses} current={state.current} review={review} onJump={jump} />
              </div>
            </div>
          </aside>
        </div>

        <nav
          aria-label="Question navigation"
          className="sticky bottom-0 z-10 border-t border-steel-700/60 bg-navy-950/95 backdrop-blur"
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <button
              type="button"
              onClick={() => goTo(state.current - 1)}
              disabled={state.current === 0}
              className={ghostButton}
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={() => setDialog('palette')}
              className={`${ghostButton} lg:hidden`}
            >
              <GridIcon className="size-4" />
              <span className="tabular-nums">
                {review ? 'Palette' : `${counts.answered}/${counts.total}`}
              </span>
              <span className="sr-only">Open question palette</span>
            </button>

            {state.current < last ? (
              <button type="button" onClick={() => goTo(state.current + 1)} className={primaryButton}>
                {running ? 'Save and next' : 'Next'}
                <ChevronRightIcon className="size-4" />
              </button>
            ) : running ? (
              <button type="button" onClick={() => setDialog('confirm')} className={primaryButton}>
                Review and submit
              </button>
            ) : (
              <button type="button" onClick={() => setDialog('result')} className={goldButton}>
                View score
              </button>
            )}
          </div>
        </nav>

        {dialog === 'palette' ? (
          <Dialog labelledBy="palette-title" variant="sheet" onClose={() => setDialog('none')}>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="palette-title" className="text-base font-semibold text-white">
                  Question palette
                </h2>
                <button type="button" onClick={() => setDialog('none')} className={ghostButton}>
                  Close
                </button>
              </div>
              <QuestionPalette statuses={statuses} current={state.current} review={review} onJump={jump} />
              {running ? (
                <button type="button" onClick={() => setDialog('confirm')} className={`${primaryButton} mt-5 w-full`}>
                  Submit test
                </button>
              ) : null}
            </div>
          </Dialog>
        ) : null}

        {dialog === 'confirm' && running ? (
          <ConfirmSubmitDialog
            counts={counts}
            remaining={limitSecs === null ? null : remaining}
            onConfirm={finalize}
            onCancel={() => setDialog('none')}
          />
        ) : null}

        {dialog === 'result' && result ? (
          <ResultDialog
            quizTitle={quiz.title}
            scheme={scheme}
            result={result}
            log={log}
            onRetryLog={() => void logAttempt(result.correct)}
            onReview={() => {
              setDialog('none');
              goTo(0);
            }}
          />
        ) : null}
      </div>
    </MotionConfig>
  );
}