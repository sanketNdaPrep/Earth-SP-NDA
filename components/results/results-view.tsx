'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { SectionCard } from '@/components/dashboard/section-card';
import { TopBar } from '@/components/dashboard/top-bar';
import { AlertIcon, ChevronLeftIcon, SpinnerIcon } from '@/components/quiz/icons';
import { formatAttemptDate } from '@/components/dashboard/analytics';
import { resolveMarkingScheme } from '@/components/quiz/scoring';
import { focusRing, ghostButton, primaryButton } from '@/components/quiz/styles';
import { FilterTabs, tabId, type FilterTab } from './filter-tabs';
import { QuestionList, rowId } from './question-list';
import { analyseAttempt, matchesFilter, percentileFor } from './review';
import { Scorecard } from './scorecard';
import { SolutionDrawer } from './solution-drawer';
import { SpeedSummary } from './speed-meter';
import type { FilterKey, ResultsState } from './types';
import { useAttemptResults } from './use-attempt-results';

const PANEL_ID = 'review-panel';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-navy-950 text-steel-100">
      <TopBar />
      {children}
    </div>
  );
}

function Notice({ tone, children }: { tone: 'gold' | 'steel'; children: React.ReactNode }) {
  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-md border px-4 py-3 text-sm leading-relaxed ${
        tone === 'gold' ? 'border-gold-400/40 bg-gold-400/10 text-gold-300' : 'border-steel-700 bg-navy-900 text-steel-300'
      }`}
    >
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Ready({ data }: { data: Extract<ResultsState, { status: 'ready' }> }) {
  const { attempt, quiz, questions, detail, cohort } = data;
  const scheme = useMemo(() => resolveMarkingScheme(quiz), [quiz]);
  const analysis = useMemo(
    () => analyseAttempt(attempt, questions, detail, scheme, quiz.time_limit_mins),
    [attempt, questions, detail, scheme, quiz.time_limit_mins],
  );
  const percentile = useMemo(() => percentileFor(attempt, analysis.result, cohort), [attempt, analysis.result, cohort]);

  const [filter, setFilter] = useState<FilterKey>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const hasDetail = detail !== null;
  const counts = useMemo(
    () => ({
      all: analysis.items.length,
      incorrect: analysis.items.filter((item) => matchesFilter(item, 'incorrect')).length,
      unattempted: analysis.items.filter((item) => matchesFilter(item, 'unattempted')).length,
      flagged: analysis.items.filter((item) => matchesFilter(item, 'flagged')).length,
    }),
    [analysis.items],
  );
  const visible = useMemo(() => analysis.items.filter((item) => matchesFilter(item, filter)), [analysis.items, filter]);

  const tabs: FilterTab[] = [
    { key: 'all', label: 'All questions', count: counts.all, disabled: false },
    { key: 'incorrect', label: 'Incorrect', count: counts.incorrect, disabled: !hasDetail },
    { key: 'unattempted', label: 'Unattempted', count: counts.unattempted, disabled: !hasDetail },
    { key: 'flagged', label: 'Flagged', count: counts.flagged, disabled: !hasDetail },
  ];

  const open = openIndex === null ? null : (visible[openIndex] ?? null);

  const closeDrawer = () => {
    const id = open ? rowId(open.question.id) : null;
    setOpenIndex(null);
    // The drawer is removed, so hand focus back to the row that opened it.
    if (id) requestAnimationFrame(() => document.getElementById(id)?.focus());
  };

  return (
    <MotionConfig reducedMotion="user">
      <Shell>
        <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 lg:px-6 lg:py-8">
          <div>
            <Link
              href="/dashboard"
              className={`inline-flex min-h-11 items-center gap-1 rounded-md pr-3 text-sm font-medium text-steel-300 hover:text-white ${focusRing}`}
            >
              <ChevronLeftIcon className="size-4" />
              Back to dashboard
            </Link>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-gold-400/50 bg-gold-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300">
                    {quiz.category}
                  </span>
                  <span className="rounded-md border border-steel-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-steel-300">
                    {scheme.label} marking
                  </span>
                  <span className="text-xs text-steel-300">{formatAttemptDate(attempt.attempted_at)}</span>
                </div>
                <h1 className="mt-3 text-balance text-2xl font-semibold text-white sm:text-3xl">{quiz.title}</h1>
                <p className="mt-1 text-sm text-steel-300">Attempt analysis and solution review</p>
              </div>
              <Link href={`/quiz/${quiz.id}`} className={primaryButton}>
                Retake this test
              </Link>
            </div>
          </div>

          {!hasDetail ? (
            <Notice tone="steel">
              Your answers and timings for this attempt are not saved on this device, so negative marking, the speed
              index and the answer filters are unavailable. The solutions below are complete. Tests you take on this
              device from now on are saved in full.
            </Notice>
          ) : null}
          {analysis.bankChanged ? (
            <Notice tone="gold">Questions were added or removed from this module after your attempt. Only the questions you saw are listed.</Notice>
          ) : null}
          {analysis.scoreDiffers ? (
            <Notice tone="gold">
              An answer key has changed since you took this test, so the score below can differ from the one logged at the time.
            </Notice>
          ) : null}

          <Scorecard
            scheme={scheme}
            result={analysis.result}
            correct={attempt.score}
            total={attempt.total_questions}
            percentile={percentile}
          />

          <SpeedSummary counts={analysis.speedCounts} averageSeconds={analysis.averageSeconds} par={analysis.par} />

          <SectionCard
            title="Solution review"
            description="Open any question for the correct answer, the working and how long it took."
            delay={0.15}
          >
            <div className="space-y-4 p-5 sm:p-6">
              <FilterTabs
                tabs={tabs}
                active={filter}
                panelId={PANEL_ID}
                onChange={(key) => {
                  setFilter(key);
                  setOpenIndex(null);
                }}
              />
              <div id={PANEL_ID} role="tabpanel" aria-labelledby={tabId(filter)} tabIndex={0} className={`rounded-md ${focusRing}`}>
                {visible.length > 0 ? (
                  <QuestionList items={visible} onOpen={setOpenIndex} />
                ) : (
                  <p className="rounded-md border border-dashed border-steel-700 px-4 py-10 text-center text-sm text-steel-300">
                    {filter === 'incorrect'
                      ? 'No wrong answers in this attempt.'
                      : filter === 'unattempted'
                        ? 'You answered every question.'
                        : filter === 'flagged'
                          ? 'You did not flag any question for review.'
                          : 'No questions to show.'}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        </main>

        {open && openIndex !== null ? (
          <SolutionDrawer
            item={open}
            position={openIndex}
            count={visible.length}
            par={analysis.par}
            onPrevious={() => setOpenIndex(Math.max(0, openIndex - 1))}
            onNext={() => setOpenIndex(Math.min(visible.length - 1, openIndex + 1))}
            onClose={closeDrawer}
          />
        ) : null}
      </Shell>
    </MotionConfig>
  );
}