'use client';

import React from 'react';

interface SeedHeaderProps {
  moduleCount: number | null;
}

export function SeedHeader({ moduleCount }: SeedHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-steel-700/50 pb-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wide text-white uppercase">
            Admin Question Seeding Portal
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          TACTICAL DATA ENTRY & MODULE SEEDING ENGINE • SUPABASE ACTIVE
        </p>
      </div>

      <div className="mt-2 sm:mt-0 flex items-center gap-3">
        <div className="px-3 py-1.5 rounded bg-navy-900 border border-steel-700 text-xs text-slate-300">
          Total Module Questions:{' '}
          <span className="font-mono font-bold text-gold-400">
            {moduleCount === null ? '...' : moduleCount}
          </span>
        </div>
      </div>
    </div>
  );
}