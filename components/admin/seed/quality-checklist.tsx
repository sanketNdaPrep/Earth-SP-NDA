'use client';

import React from 'react';
import type { Check } from './types';

interface QualityChecklistProps {
  checks: Check[];
}

export function QualityChecklist({ checks }: QualityChecklistProps) {
  const fails = checks.filter((c) => c.state === 'fail').length;
  const warns = checks.filter((c) => c.state === 'warn').length;
  const passes = checks.filter((c) => c.state === 'pass').length;

  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-3">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Quality & Formatting Checklist
        </span>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-emerald-400">{passes} Pass</span>
          {warns > 0 && <span className="text-gold-400">{warns} Warn</span>}
          {fails > 0 && <span className="text-red-400">{fails} Fail</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {checks.map((check) => {
          let badgeStyle = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
          let icon = '✓';

          if (check.state === 'fail') {
            badgeStyle = 'bg-red-950/40 text-red-400 border-red-500/40';
            icon = '✕';
          } else if (check.state === 'warn') {
            badgeStyle = 'bg-gold-400/10 text-gold-400 border-gold-400/30';
            icon = '!';
          }

          return (
            <div
              key={check.id}
              className={`p-2 rounded border text-xs flex items-start gap-2 ${badgeStyle}`}
            >
              <span className="font-mono font-bold select-none text-xs">{icon}</span>
              <div className="space-y-0.5">
                <p className="font-semibold">{check.label}</p>
                {check.hint && (
                  <p className="text-[10px] opacity-80 leading-tight">{check.hint}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}