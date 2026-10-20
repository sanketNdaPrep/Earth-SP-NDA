'use client';

import { motion } from 'framer-motion';
import { ATTEMPTS } from '@/lib/landing-content';
import { CrossIcon, StarIcon } from './icons';

const STEP = 0.16;
const START = 0.35;

export function RecordBoard() {
  const sweepDelay = START + ATTEMPTS.length * STEP;

  return (
    <figure
      aria-labelledby="record-title"
      className="brackets border border-steel-700 bg-navy-900/80 p-5 backdrop-blur-sm sm:p-7"
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span id="record-title" className="text-base font-medium text-white">
          NDA written exam record
        </span>
        <span className="font-mono text-xs tabular-nums text-steel-300">
          Sep 2023 to Apr 2026
        </span>
      </figcaption>

      <ol className="mt-5">
        {ATTEMPTS.map((attempt, index) => (
          <motion.li
            key={attempt.n}
            data-reveal
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 1 }}
            transition={{ delay: START + index * STEP, duration: 0.4, ease: 'easeOut' }}
            className="relative grid grid-cols-[2rem_1fr_auto] items-center gap-x-4 border-t border-steel-700/60 px-1 py-3.5 first:border-t-0"
          >
            {attempt.cleared && (
              <motion.span
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: sweepDelay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 origin-left border border-gold-400/50 bg-gold-400/10"
              />
            )}

            <span
              className={
                attempt.cleared
                  ? 'relative grid size-8 place-items-center rounded-full bg-gold-400 text-navy-950'
                  : 'relative grid size-8 place-items-center rounded-full border border-steel-500 text-steel-300'
              }
            >
              {attempt.cleared ? (
                <StarIcon className="size-4" />
              ) : (
                <CrossIcon className="size-3.5" />
              )}
            </span>

            <span className="relative">
              <span className="block text-sm font-medium text-steel-100">
                Attempt {attempt.n}
              </span>
              <span className="block font-mono text-xs tabular-nums text-steel-300">
                {attempt.month} {attempt.year}
              </span>
            </span>

            <span
              className={
                attempt.cleared
                  ? 'relative pr-2 text-sm font-semibold text-gold-300'
                  : 'relative text-sm text-steel-300'
              }
            >
              {attempt.cleared ? 'Cleared' : 'Not cleared'}
            </span>
          </motion.li>
        ))}
      </ol>

      <p className="mt-5 border-t border-steel-700 pt-4 text-sm text-steel-300">
        Then I attended the 5-day SSB at <span translate="no">22 SSB Bhopal</span>.
      </p>
    </figure>
  );
}