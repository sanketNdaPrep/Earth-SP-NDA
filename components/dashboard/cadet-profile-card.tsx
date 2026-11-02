'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { primaryButton } from '@/components/quiz/styles';
import type { RankProgress } from './analytics';
import type { CadetProfile, Overview } from './types';

function Meter({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-steel-300">{label}</span>
        <span className="tabular-nums text-steel-100">{detail}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-navy-950"
      >
        <div className="h-full rounded-full bg-gold-400 transition-[width] duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

interface CadetProfileCardProps {
  profile: CadetProfile;
  overview: Overview;
  rank: RankProgress;
}

export function CadetProfileCard({ profile, overview, rank }: CadetProfileCardProps) {
  const stats = [
    { label: 'Test attempts', value: String(overview.attempts) },
    { label: 'Overall accuracy', value: overview.accuracy === null ? 'No data' : `${overview.accuracy}%` },
    {
      label: 'Aggregate score',
      value: overview.aggregateQuestions === 0 ? 'No data' : `${overview.aggregateScore} / ${overview.aggregateQuestions}`,
    },
  ];

  return (
    <motion.section
      aria-labelledby="cadet-name"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-lg border border-steel-700 bg-navy-900"
    >
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-gold-400/60 bg-gold-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-300">
              {rank.tier.name}
            </span>
            <span className="rounded-md border border-steel-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-steel-300">
              Target entry: {profile.targetExam}
            </span>
          </div>
          <h1 id="cadet-name" className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl">
            {profile.fullName}
          </h1>
          {profile.email ? <p className="mt-1 break-all text-sm text-steel-300">{profile.email}</p> : null}
          <p className="mt-3 max-w-md text-sm leading-relaxed text-steel-300">{rank.tier.blurb}</p>

          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-steel-700/60 bg-navy-950 px-4 py-3">
                <dt className="text-xs text-steel-300">{stat.label}</dt>
                <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-md border border-steel-700/60 bg-navy-950 p-5">
          {rank.next ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-white">
                Next rank: <span className="text-gold-300">{rank.next.name}</span>
              </p>
              <Meter
                label="Tests taken"
                value={rank.testsProgress}
                detail={`${Math.min(overview.attempts, rank.next.minAttempts)} of ${rank.next.minAttempts}`}
              />
              <Meter
                label="Overall accuracy"
                value={rank.accuracyProgress}
                detail={`${Math.round(overview.accuracy ?? 0)}%, needs ${rank.next.minAccuracy}%`}
              />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-steel-300">
              You hold the highest rank. Keep your accuracy above {rank.tier.minAccuracy}% to keep it.
            </p>
          )}
          <Link href="/quizzes" className={`${primaryButton} w-full`}>
            Take a practice test
          </Link>
        </div>
      </div>
    </motion.section>
  );
}