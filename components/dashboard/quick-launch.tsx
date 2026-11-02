'use client';

import Link from 'next/link';
import { ClockIcon, FlagIcon } from '@/components/quiz/icons';
import { focusRing } from '@/components/quiz/styles';
import { formatAttemptDate, SUBJECT_LABELS, subjectOf } from './analytics';
import { SectionCard } from './section-card';
import type { QuizSummary, WeakModule } from './types';

const card = `group flex h-full flex-col justify-between gap-4 rounded-md border border-steel-700 bg-navy-950 p-4 transition-colors hover:border-emerald-400/60 ${focusRing}`;

interface QuickLaunchProps {
  weak: WeakModule[];
  mocks: QuizSummary[];
  hasAttempts: boolean;
  /** False when the module list failed to load. */
  modulesLoaded: boolean;
  delay?: number;
}

export function QuickLaunch({ weak, mocks, hasAttempts, modulesLoaded, delay }: QuickLaunchProps) {
  return (
    <SectionCard title="Quick launch" description="Pick up where practice will help most." delay={delay}>
      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gold-300">
            <FlagIcon className="size-4" />
            Weak topic practice
          </h3>
          {weak.length > 0 ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {weak.map((item) => (
                <li key={item.quizId}>
                  <Link href={`/quiz/${item.quizId}`} className={card}>
                    <span>
                      <span className="block font-medium text-white">{item.title}</span>
                      <span className="mt-1 block text-xs text-steel-300">
                        {item.category} · last tried {formatAttemptDate(item.attemptedAt)}
                      </span>
                    </span>
                    <span className="flex items-center justify-between text-sm">
                      <span className="font-semibold tabular-nums text-gold-300">Scored {item.accuracy}%</span>
                      <span className="font-medium text-emerald-300 group-hover:underline">Practice again</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-steel-300">
              {hasAttempts
                ? 'No weak modules right now. Every module you last tried scored 60% or more.'
                : 'Take a test and the modules that need work will show up here.'}
            </p>
          )}
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <ClockIcon className="size-4" />
            Recommended mock tests
          </h3>
          {mocks.length > 0 ? (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {mocks.map((quiz) => (
                <li key={quiz.id}>
                  <Link href={`/quiz/${quiz.id}`} className={card}>
                    <span>
                      <span className="block font-medium text-white">{quiz.title}</span>
                      <span className="mt-1 block text-xs text-steel-300">
                        {quiz.category} · {SUBJECT_LABELS[subjectOf(quiz)]}
                      </span>
                    </span>
                    <span className="flex items-center justify-between text-sm">
                      <span className="tabular-nums text-steel-300">
                        {quiz.time_limit_mins && quiz.time_limit_mins > 0 ? `${quiz.time_limit_mins} min` : 'No time limit'}
                      </span>
                      <span className="font-medium text-emerald-300 group-hover:underline">Start test</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-steel-300">
              {modulesLoaded
                ? 'You have tried every module that is available. New ones will appear here.'
                : 'The module list could not be loaded just now. Open Practice tests to see every module.'}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}