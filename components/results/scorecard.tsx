'use client';

import { motion } from 'framer-motion';
import { formatClock, formatMarks } from '@/components/quiz/scoring';
import type { AttemptResult, MarkingScheme } from '@/components/quiz/types';
import { SectionCard } from '@/components/dashboard/section-card';
import { ordinal, percentileBand, type PercentileResult } from './rank-estimate';

interface ScorecardProps {
  scheme: MarkingScheme;
  /** From the saved answers. Null when they are not on this device. */
  result: AttemptResult | null;
  /** The logged attempt, which is always available. */
  correct: number;
  total: number;
  percentile: PercentileResult | null;
}

function Tile({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: string }) {
  return (
    <div className="rounded-md border border-steel-700/60 bg-navy-950 px-4 py-3">
      <dt className="text-xs text-steel-300">{label}</dt>
      <dd className={`mt-1 font-mono text-xl font-semibold tabular-nums ${tone}`}>{value}</dd>
      <p className="mt-1 text-xs text-steel-300">{hint}</p>
    </div>
  );
}

function PercentileCard({ percentile }: { percentile: PercentileResult | null }) {
  if (!percentile) {
    return (
      <div className="rounded-md border border-steel-700/60 bg-navy-950 p-5">
        <h3 className="text-sm font-semibold text-white">Percentile estimate</h3>
        <p className="mt-2 text-sm leading-relaxed text-steel-300">
          Not available. It needs the answers saved on this device, or at least ten other attempts on this module.
        </p>
      </div>
    );
  }

  const band = percentileBand(percentile.value);
  const top = Math.max(1, 100 - percentile.value);

  return (
    <div className="rounded-md border border-steel-700/60 bg-navy-950 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">
          {percentile.source === 'cohort' ? 'Percentile' : 'Percentile estimate'}
        </h3>
        <span className="rounded-md border border-gold-400/60 bg-gold-400/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-gold-300">
          {band}
        </span>
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-white">
        {ordinal(percentile.value)}
        <span className="ml-2 text-base font-normal text-steel-300">percentile</span>
      </p>
      <p className="mt-1 text-sm text-steel-100">Estimated rank: top {top}% of aspirants</p>

      <div
        role="meter"
        aria-label="Percentile"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentile.value}
        className="relative mt-4 h-2.5 rounded-full bg-navy-900"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentile.value}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full bg-emerald-400"
        />
      </div>
      <div className="mt-1 flex justify-between text-xs tabular-nums text-steel-300">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-steel-300">
        {percentile.source === 'cohort'
          ? `Worked out from ${percentile.sample} other attempts on this module.`
          : 'A guide, not a ranking. It assumes a typical spread of aspirant scores, because live rankings are not available.'}
      </p>
    </div>
  );
}

export function Scorecard({ scheme, result, correct, total, percentile }: ScorecardProps) {
  const gained = result ? result.gained : Math.round(correct * scheme.correct * 100) / 100;
  const net = result ? result.marks : null;
  const max = result ? result.maxMarks : Math.round(total * scheme.correct * 100) / 100;
  const negative = net !== null && net < 0;

  return (
    <SectionCard
      title="Scorecard"
      description={`${scheme.label} marking: +${formatMarks(scheme.correct)} for each correct answer, ${
        scheme.wrong > 0 ? `-${formatMarks(scheme.wrong)} for each wrong one` : 'no penalty for wrong answers'
      }.`}
      delay={0.05}
    >
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div>
          <div className="rounded-md border border-steel-700 bg-navy-950 p-5">
            <p className="text-sm text-steel-300">Net score</p>
            <p className="mt-1 font-mono text-4xl font-semibold tabular-nums sm:text-5xl">
              {net === null ? (
                <span className="text-steel-300">Not available</span>
              ) : (
                <span className={negative ? 'text-gold-300' : 'text-emerald-400'}>{formatMarks(net)}</span>
              )}
              {net !== null ? <span className="text-xl text-steel-300"> / {formatMarks(max)}</span> : null}
            </p>
            {net === null ? (
              <p className="mt-2 text-sm leading-relaxed text-steel-300">
                Negative marking needs your answers, which are saved only on the device where the test was taken.
                Your logged result is {correct} of {total} correct.
              </p>
            ) : null}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile
              label="Marks gained"
              value={`+${formatMarks(gained)}`}
              hint={`${correct} correct`}
              tone="text-emerald-300"
            />
            <Tile
              label="Negative marks"
              value={result ? (result.deducted > 0 ? `-${formatMarks(result.deducted)}` : formatMarks(0)) : 'Not saved'}
              hint={result ? `${result.wrong} wrong` : 'Needs your answers'}
              tone={result && result.deducted > 0 ? 'text-gold-300' : 'text-steel-100'}
            />
            <Tile
              label="Accuracy"
              value={
                result
                  ? result.accuracy === null
                    ? 'None'
                    : `${result.accuracy}%`
                  : total > 0
                    ? `${Math.round((correct / total) * 100)}%`
                    : 'None'
              }
              hint={result ? `${result.attempted} attempted` : 'Of all questions'}
              tone="text-white"
            />
            <Tile
              label="Time taken"
              value={result ? formatClock(result.timeTakenSecs) : 'Not saved'}
              hint={result ? `${result.unanswered} unattempted` : 'Needs your answers'}
              tone="text-white"
            />
          </dl>
        </div>

        <PercentileCard percentile={percentile} />
      </div>
    </SectionCard>
  );
}