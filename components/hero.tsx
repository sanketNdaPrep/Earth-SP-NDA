import Link from 'next/link';
import { ForcesInfo } from './forces-info';

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden border-b border-steel-700/50"
    >
      <div aria-hidden="true" className="graticule absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:py-28">
        <div>
          <h1
            id="hero-title"
            className="max-w-xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
          >
            Practice tests, free notes and study plans for NDA, CDS and AFCAT
          </h1>
          <p className="mt-6 max-w-[56ch] text-pretty text-lg leading-relaxed text-steel-300">
            I failed the NDA written exam five times and cleared it on my sixth attempt, in
            April 2026. These are the tests, notes and plans that helped me study with a
            system.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quizzes"
              className="inline-flex min-h-12 touch-manipulation items-center justify-center rounded-md bg-emerald-400 px-6 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-300"
            >
              Take a practice test
            </Link>
            <a
              href="#vault"
              className="inline-flex min-h-12 touch-manipulation items-center justify-center rounded-md border border-steel-500 px-6 text-sm font-semibold text-steel-100 transition-colors hover:border-steel-300 hover:bg-white/5"
            >
              Browse free notes
            </a>
          </div>
        </div>

        <ForcesInfo />
      </div>
    </section>
  );
}