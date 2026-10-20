'use client';

import { useId, type ReactNode } from 'react';
import { motion } from 'framer-motion';

/** Shared section frame: bordered navy surface, title row, entrance animation. */
export function Panel({
  title,
  description,
  action,
  delay = 0,
  className = '',
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const titleId = useId();

  return (
    <motion.section
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`rounded-md border border-steel-700 bg-navy-900 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-steel-700/60 px-5 py-4 sm:px-6">
        <div>
          <h2 id={titleId} className="text-base font-semibold text-white">
            {title}
          </h2>
          {description ? <p className="mt-1 text-sm text-steel-300">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}