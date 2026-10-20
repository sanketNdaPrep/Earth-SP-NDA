'use client';

import Link from 'next/link';
import { useLandingData } from './landing-data';

export function CadetSnapshot() {
  const { user, stats, downloadedFiles } = useLandingData();

  if (!user) return null;

  const figures = [
    { label: 'Tests completed', value: String(stats.totalTests), tone: 'text-white' },
    { label: 'Average accuracy', value: `${stats.avgAccuracy}%`, tone: 'text-emerald-300' },
    { label: 'Notes opened this visit', value: String(downloadedFiles.length), tone: 'text-white' },
  ];

  return (
    <section aria-labelledby="snapshot-title" className="mx-auto w-full max-w-6xl px-5 pt-10">
      <div className="brackets border border-steel-700 bg-navy-900 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2
              id="snapshot-title"
              className="break-words text-xl font-semibold text-white sm:text-2xl"
            >
              Welcome back, {user.name}
            </h2>
            <p className="mt-1 text-sm text-steel-300">
              Target exam: <span className="text-steel-100">{user.targetExam}</span>
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 shrink-0 touch-manipulation items-center justify-center rounded-md border border-emerald-400/50 px-4 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/10"
          >
            Open your dashboard
          </Link>
        </div>

        <dl className="mt-6 grid gap-px overflow-hidden bg-steel-700/60 sm:grid-cols-3">
          {figures.map((figure) => (
            <div key={figure.label} className="bg-navy-900 px-4 py-4">
              <dt className="text-sm text-steel-300">{figure.label}</dt>
              <dd className={`mt-1 text-3xl font-semibold tabular-nums ${figure.tone}`}>
                {figure.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}