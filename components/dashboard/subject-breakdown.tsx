'use client';

import { motion } from 'framer-motion';
import { WEAK_BELOW_PERCENT } from './analytics';
import { SectionCard } from './section-card';
import type { SubjectStat } from './types';

const CIRCUMFERENCE = 2 * Math.PI * 25;

function AccuracyDonut({ stat, weak, delay }: { stat: SubjectStat; weak: boolean; delay: number }) {
  const accuracy = stat.accuracy ?? 0;
  return (
    <div role="meter" aria-label={stat.label + ' accuracy'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stat.accuracy ?? 0} aria-valuetext={stat.accuracy === null ? 'No tests yet' : String(stat.accuracy) + ' percent'} className="relative size-16 shrink-0">
      <svg viewBox="0 0 64 64" className="-rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r="25" fill="none" strokeWidth="5" className="donut-track stroke-zinc-800" />
        <motion.circle
          cx="32" cy="32" r="25" fill="none" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - accuracy / 100) }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
          className={weak ? 'text-amber-400' : 'text-emerald-400'}
          stroke="currentColor"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-mono text-xs font-semibold tabular-nums text-white">
        {stat.accuracy === null ? 'N/A' : String(stat.accuracy) + '%'}
      </span>
    </div>
  );
}

export function SubjectBreakdown({ stats, delay }: { stats: SubjectStat[]; delay?: number }) {
  return (
    <SectionCard title="Subject performance" description="Accuracy by paper, from the answers you got right." delay={delay}>
      <ul className="divide-y divide-zinc-800/80 px-5 sm:px-6">
        {stats.map((stat, index) => {
          const weak = stat.accuracy !== null && stat.accuracy < WEAK_BELOW_PERCENT;
          return (
            <li key={stat.key} className="flex items-center gap-4 py-4 first:pt-5 last:pb-5">
              <AccuracyDonut stat={stat} weak={weak} delay={(delay ?? 0) + 0.12 + index * 0.08} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-sm font-medium text-white">{stat.label}</span>
                  {weak && <span className="text-xs font-semibold text-amber-400">Practice focus</span>}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  {stat.accuracy === null
                    ? 'No tests yet'
                    : String(stat.correct) + ' of ' + stat.questions + ' correct across ' + stat.attempts + ' ' + (stat.attempts === 1 ? 'test' : 'tests')}
                </p>
                {weak && <p className="mt-1 text-xs text-amber-400">Below {WEAK_BELOW_PERCENT}%. Worth extra practice.</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}