'use client';

import { useState } from 'react';
import Link from 'next/link';
import { focusRing, ghostButton, primaryButton } from '@/components/quiz/styles';
import { formatAttemptDate, SUBJECT_LABELS, subjectOf } from './analytics';
import { SectionCard } from './section-card';
import type { AttemptRow } from './types';

const PAGE = 6;

export function AttemptLog({ attempts, delay }: { attempts: AttemptRow[]; delay?: number }) {
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? attempts : attempts.slice(0, PAGE);

  return (
    <SectionCard
      title="Recent attempts"
      description="Your latest tests, newest first. Open one for the full analysis."
      delay={delay}
    >
      {attempts.length === 0 ? (
        <div className="px-5 py-10 text-center sm:px-6">
          <p className="text-sm text-steel-300">No tests attempted yet.</p>
          <Link href="/quizzes" className={`${primaryButton} mt-4`}>
            Attempt your first test
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-steel-700/60">
            {rows.map((item) => {
              const accuracy = item.total_questions > 0 ? Math.round((item.score / item.total_questions) * 100) : 0;
              return (
                <li key={item.id}>
                  <Link
                    href={`/quizzes/results/${item.id}`}
                    className={`grid gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-white/5 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6 ${focusRing}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-white">{item.quiz?.title ?? 'Practice drill'}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-steel-300">
                        <span className="rounded border border-steel-700 px-1.5 py-0.5">
                          {item.quiz?.category ?? 'General'}
                        </span>
                        <span>{SUBJECT_LABELS[subjectOf(item.quiz)]}</span>
                        <span>{formatAttemptDate(item.attempted_at)}</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-4 sm:justify-end">
                      <span className="font-mono text-base font-semibold tabular-nums text-white">
                        {item.score} / {item.total_questions}
                      </span>
                      <span
                        className={`min-w-14 rounded-md border px-2 py-1 text-center text-sm font-semibold tabular-nums ${
                          accuracy >= 60
                            ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
                            : 'border-gold-400/50 bg-gold-400/10 text-gold-300'
                        }`}
                      >
                        {accuracy}%
                      </span>
                      <span className="text-sm font-medium text-emerald-300">Review</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {attempts.length > PAGE ? (
            <div className="border-t border-steel-700/60 px-5 py-3 sm:px-6">
              <button type="button" onClick={() => setShowAll((value) => !value)} className={ghostButton} aria-expanded={showAll}>
                {showAll ? 'Show fewer' : `Show all ${attempts.length} attempts`}
              </button>
            </div>
          ) : null}
        </>
      )}
    </SectionCard>
  );
}