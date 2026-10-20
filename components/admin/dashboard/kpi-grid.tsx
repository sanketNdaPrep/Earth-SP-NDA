'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { formatCount } from './format';

export interface Kpi {
  id: string;
  label: string;
  /** null renders a dash, for metrics that are not connected yet. */
  value: number | null;
  hint: string;
  icon: ReactNode;
  source: 'live' | 'preview';
  /** 'attention' turns the number gold, for things that need an admin to act. */
  tone?: 'default' | 'attention';
}

export function KpiGrid({ items }: { items: Kpi[] }) {
  return (
    <ul aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi, index) => (
        <motion.li
          key={kpi.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 + index * 0.06, ease: 'easeOut' }}
          className="group flex flex-col rounded-md border border-steel-700 bg-navy-900 p-5 transition-[border-color,box-shadow] duration-200 hover:border-emerald-400/50 hover:shadow-[0_0_32px_-12px_rgb(52_211_153/0.55)]"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-10 place-items-center rounded-md border border-steel-700 bg-navy-950 text-emerald-300 transition-colors group-hover:border-emerald-400/40">
              {kpi.icon}
            </span>
            {kpi.source === 'preview' ? (
              <span className="rounded-sm border border-steel-700 px-1.5 py-0.5 text-xs text-steel-300">
                Preview data
              </span>
            ) : null}
          </div>

          <p className="mt-5 text-sm text-steel-300">{kpi.label}</p>
          <p
            className={`mt-1 text-3xl font-semibold tabular-nums ${
              kpi.tone === 'attention' ? 'text-gold-300' : 'text-white'
            }`}
          >
            {kpi.value === null ? '-' : formatCount(kpi.value)}
          </p>
          <p className="mt-2 text-xs text-steel-300">{kpi.hint}</p>
        </motion.li>
      ))}
    </ul>
  );
}