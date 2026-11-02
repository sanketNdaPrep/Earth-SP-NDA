'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { MotionConfig } from 'framer-motion';
import { AlertIcon, SpinnerIcon } from '@/components/quiz/icons';
import { ghostButton, primaryButton } from '@/components/quiz/styles';
import {
  computeOverview,
  pendingMocks,
  rankProgress,
  subjectBreakdown,
  weakestSubject,
  weakModules,
} from './analytics';
import { AttemptLog } from './attempt-log';
import { CadetProfileCard } from './cadet-profile-card';
import { QuickLaunch } from './quick-launch';
import { SubjectBreakdown } from './subject-breakdown';
import { TopBar } from './top-bar';
import { useDashboardData } from './use-dashboard-data';
import type { AttemptRow, CadetProfile, QuizSummary } from './types';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-navy-950 text-steel-100">
      <TopBar />
      {children}
    </div>
  );
}

function Ready({
  profile,
  attempts,
  quizzes,
  quizzesFailed,
}: {
  profile: CadetProfile;
  attempts: AttemptRow[];
  quizzes: QuizSummary[];
  quizzesFailed: boolean;
}) {
  const overview = useMemo(() => computeOverview(attempts), [attempts]);
  const rank = useMemo(() => rankProgress(overview), [overview]);
  const subjects = useMemo(() => subjectBreakdown(attempts), [attempts]);
  const weak = useMemo(() => weakModules(attempts), [attempts]);
  const mocks = useMemo(
    () => pendingMocks(quizzes, attempts, profile.targetExam, weakestSubject(subjects)),
    [quizzes, attempts, profile.targetExam, subjects],
  );

  return (
    <MotionConfig reducedMotion="user">
      <Shell>
        <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 lg:px-6 lg:py-8">
          <CadetProfileCard profile={profile} overview={overview} rank={rank} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
            <div className="min-w-0 space-y-6">
              <AttemptLog attempts={attempts} delay={0.1} />
              <SubjectBreakdown stats={subjects} delay={0.2} />
            </div>
            <QuickLaunch
              weak={weak}
              mocks={mocks}
              hasAttempts={attempts.length > 0}
              modulesLoaded={!quizzesFailed}
              delay={0.15}
            />
          </div>
        </main>
      </Shell>
    </MotionConfig>
  );
}

export function DashboardView() {
  const { state, retry } = useDashboardData();

  if (state.status === 'loading') {
    return (
      <Shell>
        <main className="flex min-h-[60dvh] items-center justify-center px-4">
          <p role="status" className="flex items-center gap-3 text-sm text-steel-300">
            <SpinnerIcon className="size-5 text-emerald-400" />
            Loading cadet profile and performance...
          </p>
        </main>
      </Shell>
    );
  }

  if (state.status === 'error') {
    return (
      <Shell>
        <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-4 text-center">
          <AlertIcon className="size-8 text-gold-400" />
          <h1 className="mt-4 text-xl font-semibold text-white">Your dashboard could not be loaded</h1>
          <p role="alert" className="mt-2 text-sm leading-relaxed text-steel-300">
            {state.message}
          </p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={retry} className={primaryButton}>
              Try again
            </button>
            <Link href="/quizzes" className={ghostButton}>
              Practice tests
            </Link>
          </div>
        </main>
      </Shell>
    );
  }

  return (
    <Ready
      profile={state.profile}
      attempts={state.attempts}
      quizzes={state.quizzes}
      quizzesFailed={state.quizzesFailed}
    />
  );
}