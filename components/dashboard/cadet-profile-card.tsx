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
        <span className="text-zinc-400">{label}</span>
        <span className="tabular-nums text-zinc-200">{detail}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-950"
      >
        <div className="h-full rounded-full bg-amber-400 transition-[width] duration-500" style={{ width: `${value}%` }} />
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
      className="rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-lg shadow-black/40"
    >
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-full p-[2px]" aria-hidden="true">
              <span className="profile-halo absolute inset-0 rounded-full" />
              <span className="relative grid size-full place-items-center rounded-full bg-zinc-950 font-mono text-xs font-bold text-amber-400 border border-amber-400/30">
                {profile.fullName.trim().charAt(0).toUpperCase()}
              </span>
            </span>
            <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
              {rank.tier.name}
            </span>
            <span className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Target entry: {profile.targetExam}
            </span>
          </div>
          <h1 id="cadet-name" className="mt-4 text-balance text-2xl font-semibold text-white sm:text-3xl">
            {profile.fullName}
          </h1>
          {profile.email ? <p className="mt-1 break-all text-sm text-zinc-400">{profile.email}</p> : null}
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">{rank.tier.blurb}</p>

          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3">
                <dt className="text-xs text-zinc-400">{stat.label}</dt>
                <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-lg border border-zinc-800 bg-zinc-950/80 p-5">
          {rank.next ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-white">
                Next rank: <span className="text-amber-400">{rank.next.name}</span>
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
            <p className="text-sm leading-relaxed text-zinc-400">
              You hold the highest rank. Keep your accuracy above {rank.tier.minAccuracy}% to keep it.
            </p>
          )}
          <Link href="/quizzes" className={`${primaryButton} w-full text-center`}>
            Take a practice test
          </Link>
        </div>
      </div>
    </motion.section>
  );
}