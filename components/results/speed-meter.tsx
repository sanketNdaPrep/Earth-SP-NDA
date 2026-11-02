'use client';

import { SectionCard } from '@/components/dashboard/section-card';
import {
  formatSeconds,
  GAUGE_ZONES,
  gaugePosition,
  RUSH_BELOW,
  SLOW_ABOVE,
  SPEED_LABEL,
  type SpeedClass,
} from './speed';

export const SPEED_TEXT: Record<SpeedClass, string> = {
  rush: 'text-gold-300',
  optimal: 'text-emerald-300',
  slow: 'text-gold-300',
};

const ZONE_CLASS = {
  rush: 'bg-gold-400/30',
  optimal: 'bg-emerald-400/35',
  slow: 'bg-gold-400/60',
} as const;

/** A three-zone gauge with a marker at the time spent on one question. */
export function SpeedGauge({ seconds, par, speed }: { seconds: number; par: number; speed: SpeedClass }) {
  const position = gaugePosition(seconds, par) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className={`font-semibold ${SPEED_TEXT[speed]}`}>{SPEED_LABEL[speed]}</span>
        <span className="tabular-nums text-steel-300">
          {formatSeconds(seconds)} spent, par {formatSeconds(par)}
        </span>
      </div>
      <div
        role="meter"
        aria-label="Time spent on this question"
        aria-valuemin={0}
        aria-valuemax={Math.round(par * 3)}
        aria-valuenow={Math.min(Math.round(seconds), Math.round(par * 3))}
        aria-valuetext={`${SPEED_LABEL[speed]}: ${formatSeconds(seconds)} against a par of ${formatSeconds(par)}`}
        className="relative mt-2 flex h-3 overflow-visible rounded-full"
      >
        <span className={`rounded-l-full ${ZONE_CLASS.rush}`} style={{ width: `${GAUGE_ZONES.rush * 100}%` }} />
        <span className={ZONE_CLASS.optimal} style={{ width: `${GAUGE_ZONES.optimal * 100}%` }} />
        <span className={`rounded-r-full ${ZONE_CLASS.slow}`} style={{ width: `${GAUGE_ZONES.slow * 100}%` }} />
        <span
          aria-hidden="true"
          className="absolute -top-1 h-5 w-1 -translate-x-1/2 rounded-full bg-white shadow"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="mt-1.5 flex text-xs text-steel-300">
        <span style={{ width: `${GAUGE_ZONES.rush * 100}%` }}>Rush</span>
        <span className="text-center" style={{ width: `${GAUGE_ZONES.optimal * 100}%` }}>
          Optimal
        </span>
        <span className="text-right" style={{ width: `${GAUGE_ZONES.slow * 100}%` }}>
          Slow
        </span>
      </div>
    </div>
  );
}

interface SpeedSummaryProps {
  counts: Record<SpeedClass, number> | null;
  averageSeconds: number | null;
  par: number;
}

/** The whole paper at a glance: how many questions were rushed, comfortable or slow. */
export function SpeedSummary({ counts, averageSeconds, par }: SpeedSummaryProps) {
  if (!counts || averageSeconds === null) {
    return (
      <SectionCard title="Speed index" description="How long each question took." delay={0.1}>
        <p className="p-5 text-sm leading-relaxed text-steel-300 sm:p-6">
          Timing was not saved for this attempt. It is recorded when you take a test on this device.
        </p>
      </SectionCard>
    );
  }

  const total = counts.rush + counts.optimal + counts.slow;
  const order: SpeedClass[] = ['rush', 'optimal', 'slow'];
  const bar: Record<SpeedClass, string> = { rush: 'bg-gold-400/50', optimal: 'bg-emerald-400', slow: 'bg-gold-400' };
  const dominant = order.reduce((best, key) => (counts[key] > counts[best] ? key : best), 'optimal' as SpeedClass);

  return (
    <SectionCard
      title="Speed index"
      description={`Par is ${formatSeconds(par)} a question. Under ${Math.round(RUSH_BELOW * 100)}% of par is a rush, over ${Math.round(
        SLOW_ABOVE * 100,
      )}% is slow.`}
      delay={0.1}
    >
      <div className="p-5 sm:p-6">
        <p className="text-sm text-steel-100">
          You averaged <span className="font-mono font-semibold tabular-nums text-white">{formatSeconds(averageSeconds)}</span> per
          question.{' '}
          {dominant === 'optimal'
            ? 'Most questions got a comfortable amount of time.'
            : dominant === 'rush'
              ? 'You rushed most questions. Slow down and read each one fully.'
              : 'Most questions took longer than they should. Practise moving on sooner.'}
        </p>

        <div role="img" aria-label={`${counts.rush} rushed, ${counts.optimal} optimal, ${counts.slow} slow`} className="mt-4 flex h-3 overflow-hidden rounded-full bg-navy-950">
          {order.map((key) =>
            counts[key] > 0 ? (
              <span key={key} className={bar[key]} style={{ width: `${(counts[key] / total) * 100}%` }} />
            ) : null,
          )}
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-3 text-center">
          {order.map((key) => (
            <li key={key} className="rounded-md border border-steel-700/60 bg-navy-950 px-2 py-3">
              <p className="font-mono text-xl font-semibold tabular-nums text-white">{counts[key]}</p>
              <p className={`text-xs font-semibold ${SPEED_TEXT[key]}`}>{SPEED_LABEL[key]}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}