'use client';

import { motion } from 'framer-motion';
import { JOURNEY, type JourneyOutcome } from '@/lib/landing-content';
import { CheckIcon, CrossIcon, StarIcon } from './icons';

function Marker({ outcome }: { outcome: JourneyOutcome }) {
  const base = 'relative z-10 col-start-1 row-start-1 grid size-8 place-items-center rounded-full';

  if (outcome === 'cleared') {
    return (
      <span className={`${base} bg-gold-400 text-navy-950 ring-4 ring-gold-400/20`}>
        <StarIcon className="size-4" />
      </span>
    );
  }
  if (outcome === 'ssb') {
    return (
      <span className={`${base} border border-emerald-400 bg-navy-950 text-emerald-300`}>
        <CheckIcon className="size-4" />
      </span>
    );
  }
  if (outcome === 'failed') {
    return (
      <span className={`${base} border border-steel-500 bg-navy-950 text-steel-300`}>
        <CrossIcon className="size-3.5" />
      </span>
    );
  }
  return (
    <span className={`${base} border border-steel-500 bg-navy-950`}>
      <span className="size-2 rounded-full bg-steel-300" />
    </span>
  );
}

const outcomeLabel: Record<JourneyOutcome, string> = {
  start: 'Start',
  failed: 'Not cleared',
  cleared: 'Cleared',
  ssb: 'SSB attended',
};

export function Journey() {
  return (
    <section
      id="journey"
      aria-labelledby="journey-title"
      className="scroll-mt-20 border-t border-steel-700/40 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5">
        <h2
          id="journey-title"
          className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          My journey to the NDA result
        </h2>
        <p className="mt-3 max-w-[60ch] text-steel-300">
          From a village ground in 9th class to the SSB at 22 SSB Bhopal, including every attempt
          that did not work.
        </p>

        <ol className="mt-12 max-w-4xl">
          {JOURNEY.map((entry, index) => (
            <motion.li
              key={`${entry.when}-${entry.title}`}
              data-reveal
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 pb-10 last:pb-0 md:grid-cols-[2rem_9rem_1fr] md:gap-x-6"
            >
              {index < JOURNEY.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-4 top-8 w-px -translate-x-1/2 bg-steel-700"
                />
              )}

              <div className="col-start-1 row-span-2 row-start-1 md:row-span-1">
                <Marker outcome={entry.outcome} />
              </div>

              <p className="col-start-2 row-start-1 font-mono text-xs tabular-nums text-steel-300 md:pt-2">
                {entry.when}
              </p>

              <div className="col-start-2 row-start-2 md:col-start-3 md:row-start-1">
                <h3
                  className={`text-lg font-semibold leading-snug ${
                    entry.outcome === 'cleared' ? 'text-gold-300' : 'text-white'
                  }`}
                >
                  {entry.title}
                  <span className="sr-only"> ({outcomeLabel[entry.outcome]})</span>
                </h3>
                <p className="mt-1.5 max-w-[62ch] leading-relaxed text-steel-300">{entry.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}