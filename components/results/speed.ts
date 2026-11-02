/**
 * Speed index. "Par" is the time one question gets if the paper is spent evenly
 * (time allowed divided by number of questions). Below 35% of par the cadet rushed it,
 * above 160% of par it was slow, and anything between is a comfortable pace.
 */
export type SpeedClass = 'rush' | 'optimal' | 'slow';

export const RUSH_BELOW = 0.35;
export const SLOW_ABOVE = 1.6;
/** The gauge runs from zero to this many times par. */
export const GAUGE_MAX = 3;
/** Par for a module with no time limit. */
const DEFAULT_PAR_SECS = 60;

export const SPEED_LABEL: Record<SpeedClass, string> = {
  rush: 'Rush',
  optimal: 'Optimal',
  slow: 'Slow',
};

export function parSeconds(limitSecs: number | null, questionCount: number): number {
  if (limitSecs === null || limitSecs <= 0 || questionCount <= 0) return DEFAULT_PAR_SECS;
  return limitSecs / questionCount;
}

export function classifySpeed(seconds: number, par: number): SpeedClass {
  const ratio = seconds / par;
  if (ratio < RUSH_BELOW) return 'rush';
  if (ratio > SLOW_ABOVE) return 'slow';
  return 'optimal';
}

/** Where the marker sits on the gauge, 0 to 1. */
export function gaugePosition(seconds: number, par: number): number {
  return Math.min(1, Math.max(0, seconds / (par * GAUGE_MAX)));
}

/** Widths of the Rush, Optimal and Slow zones on the gauge, as fractions that sum to 1. */
export const GAUGE_ZONES = {
  rush: RUSH_BELOW / GAUGE_MAX,
  optimal: (SLOW_ABOVE - RUSH_BELOW) / GAUGE_MAX,
  slow: (GAUGE_MAX - SLOW_ABOVE) / GAUGE_MAX,
} as const;

export function formatSeconds(seconds: number): string {
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded}s`;
  return `${Math.floor(rounded / 60)}m ${String(rounded % 60).padStart(2, '0')}s`;
}