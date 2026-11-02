/**
 * Percentile and rank estimates.
 *
 * With enough attempts on the same module the percentile is real: the share of attempts that scored lower.
 * Otherwise it is an estimate that assumes net marks follow a bell curve centred on 32% of the
 * maximum with a spread of 16 points, a typical shape for competitive defence papers.
 * It is a guide for planning, not a prediction of an actual rank.
 */
export const ESTIMATE_MEAN_PERCENT = 32;
export const ESTIMATE_SPREAD_PERCENT = 16;
/** Smallest group on a module for the real percentile to be shown. */
export const MIN_COHORT = 10;

/** Error function, Abramowitz and Stegun 7.1.26 (accurate to about 1e-7). */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const poly = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  return sign * (1 - poly * Math.exp(-ax * ax));
}

const clampPercentile = (value: number) => Math.min(99, Math.max(1, Math.round(value)));

/** Percentile (1 to 99) for a net score given as a percentage of the maximum marks. */
export function estimatePercentile(netPercent: number): number {
  const z = (netPercent - ESTIMATE_MEAN_PERCENT) / ESTIMATE_SPREAD_PERCENT;
  return clampPercentile(50 * (1 + erf(z / Math.SQRT2)));
}

/** Percentile among `others`, counting ties as half. `mine` and `others` are accuracies from 0 to 1. */
export function cohortPercentile(others: readonly number[], mine: number): number {
  const below = others.filter((value) => value < mine - 1e-9).length;
  const tied = others.filter((value) => Math.abs(value - mine) <= 1e-9).length;
  return clampPercentile(((below + tied / 2) / others.length) * 100);
}

export type PercentileBand = 'Elite' | 'Strong' | 'Competitive' | 'Building';

export function percentileBand(percentile: number): PercentileBand {
  if (percentile >= 90) return 'Elite';
  if (percentile >= 70) return 'Strong';
  if (percentile >= 40) return 'Competitive';
  return 'Building';
}

export function ordinal(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export interface PercentileResult {
  value: number;
  source: 'cohort' | 'estimate';
  /** Attempts the percentile was worked out from, for the cohort source. */
  sample: number;
}