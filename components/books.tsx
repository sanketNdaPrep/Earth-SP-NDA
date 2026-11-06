'use client';

import { motion } from 'framer-motion';
import { BOOKS } from '@/lib/landing-content';

export function Books() {
  return (
    <section id="books" aria-labelledby="books-title" className="scroll-mt-20 border-t border-zinc-800/80 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-amber-400">Field notes / 01</p>
            <h2 id="books-title" className="mt-3 text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Recommended books and how to use them
            </h2>
          </div>
          <p className="max-w-[42ch] text-sm leading-relaxed text-zinc-400">
            A book only helps if you use it on a schedule. Start with a clear routine for each subject.
          </p>
        </div>
        <ul className="mt-9 grid gap-5 md:grid-cols-2">
          {BOOKS.map((book, index) => (
            <motion.li
              key={book.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative isolate overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-lg shadow-black/40 transition-colors hover:border-zinc-700 sm:p-7"
            >
              <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-14 -z-10 size-48 rounded-full border border-amber-400/10 transition-transform duration-500 group-hover:scale-110" />
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">{book.category}</span>
                <span className="font-mono text-xs tabular-nums text-zinc-500">0{index + 1}</span>
              </div>
              <h3 className="mt-6 max-w-sm text-pretty text-2xl font-semibold leading-tight text-white">{book.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">{book.author}</p>
              <div className="mt-7 grid gap-5 border-t border-zinc-800/80 pt-5 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Best for</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-200">{book.bestFor}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-400">Daily drill</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{book.usageGuide}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}