'use client';

import { Progress } from '@/components/ui/progress';
import { SectionCard } from './section-card';
import type { SubjectStat } from './types';

/** Accuracy by subject across all of the cadet's attempts. */
export function SubjectBreakdown({ stats, delay }: { stats: SubjectStat[]; delay?: number }) {
  return (
    <SectionCard
      title="Subject breakdown"
      description="Your accuracy in each subject, from every test you have attempted."
      delay={delay}
    >
      <ul className="divide-y divide-steel-700/60">
        {stats.map((stat) => {
          const hasAttempts = stat.accuracy !== null;
          return (
            <li key={stat.key} className="space-y-2 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-white">{stat.label}</span>
                {hasAttempts ? (
                  <span className="font-mono text-sm tabular-nums text-steel-300">
                    {stat.correct} / {stat.questions} correct ·{' '}
                    <span className="font-semibold text-white">{stat.accuracy}%</span>
                  </span>
                ) : (
                  <span className="text-xs text-steel-500">No attempts yet</span>
                )}
              </div>
              <Progress
                label={`${stat.label} accuracy`}
                value={stat.accuracy ?? 0}
                size="sm"
                tone={hasAttempts && (stat.accuracy ?? 0) >= 60 ? 'emerald' : 'gold'}
              />
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}

export default SubjectBreakdown;
