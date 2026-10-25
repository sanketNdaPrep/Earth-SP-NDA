import { ClockIcon } from './icons';
import { formatClock } from './scoring';

/** Below this many seconds the timer switches to its warning state. */
export const WARNING_SECS = 5 * 60;
export const CRITICAL_SECS = 60;

interface QuizTimerProps {
  /** Seconds left, or null before the first tick. */
  remaining: number | null;
  /** True for a module with no time limit. */
  untimed: boolean;
}

export function QuizTimer({ remaining, untimed }: QuizTimerProps) {
  const warning = remaining !== null && remaining < WARNING_SECS;
  const critical = remaining !== null && remaining < CRITICAL_SECS;

  const tone = critical
    ? 'border-gold-400 bg-gold-400 text-navy-950 motion-safe:animate-pulse'
    : warning
      ? 'border-gold-400 bg-gold-400/10 text-gold-300'
      : 'border-steel-700 bg-navy-900 text-emerald-400';

  // Spoken once when each threshold is crossed, because the text only changes then.
  const announcement = critical
    ? 'Less than one minute remaining.'
    : warning
      ? 'Less than five minutes remaining.'
      : '';

  return (
    <div>
      <div
        role="timer"
        aria-label="Time remaining"
        className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 font-mono text-lg font-semibold tabular-nums transition-colors ${tone}`}
      >
        <ClockIcon className="size-5" />
        <span>{untimed ? 'No limit' : remaining === null ? '--:--' : formatClock(remaining)}</span>
        {warning ? (
          <span className="hidden text-xs font-semibold uppercase tracking-wider sm:inline">
            {critical ? 'Final minute' : 'Under 5 min'}
          </span>
        ) : null}
      </div>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}