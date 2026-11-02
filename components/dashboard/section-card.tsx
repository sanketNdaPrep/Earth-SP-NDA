'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Seconds before the entrance starts, so a page can reveal its sections in order. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/** A titled panel with a short entrance. Shared by the dashboard and the results page. */
export function SectionCard({ title, description, action, delay = 0, className = '', children }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={`rounded-lg border border-steel-700 bg-navy-900 ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-steel-700/60 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-steel-300">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </motion.section>
  );
}