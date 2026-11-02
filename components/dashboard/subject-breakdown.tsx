'use client';

import { motion } from 'framer-motion';
import { WEAK_BELOW_PERCENT } from './analytics';
import { SectionCard } from './section-card';
import type { SubjectStat } from './types';

export function SubjectBreakdown({ stats, delay }: { stats: SubjectStat[]; delay?: number }) {
  return (
    <SectionCard
      title="Subject performance"
      description="Accuracy by paper, from the answers you got right."
      delay={delay}
    >
      <ul className="space-y-5 p-5 sm:p-6">
        {stats.map((stat, index) => {
          const weak = stat.accuracy !== null && stat.accuracy < WEAK_BELOW_PERCENT;
          return (
            <li key={stat.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm font-medium text-white">{stat.label}</span>
                <span className="text-sm tabular-nums text-steel-300">
                  {stat.accuracy === null ? (
                    'No tests yet'
                  ) : (
                    <>
                      <span className={`font-semibold ${weak ? 'text-gold-300' : 'text-emerald-300'}`}>{stat.accuracy}%</span>
                      {` · ${stat.correct} of ${stat.questions} correct in ${stat.attempts} ${stat.attempts === 1 ? 'test' : 'tests'}`}
                    </>
                  )}
                </span>
              </div>
              <div
                role="meter"
                aria-label={`${stat.label} accuracy`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={stat.accuracy ?? 0}
                aria-valuetext={stat.accuracy === null ? 'No tests yet' : `${stat.accuracy} percent`}
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-navy-950"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.accuracy ?? 0}%` }}
                  transition={{ duration: 0.6, delay: (delay ?? 0) + 0.1 + index * 0.08, ease: 'easeOut' }}
                  className={`h-full rounded-full ${weak ? 'bg-gold-400' : 'bg-emerald-400'}`}
                />
              </div>
              {weak ? <p className="mt-1.5 text-xs text-gold-300">Below {WEAK_BELOW_PERCENT}%. Worth extra practice.</p> : null}
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}