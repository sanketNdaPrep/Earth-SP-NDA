'use client';

import React from 'react';
import { OPTS } from './data';
import type { FieldKey, Opt, OptionsMap } from './types';

interface OptionsGridProps {
  options: OptionsMap;
  setOption: (opt: Opt, val: string) => void;
  correct: Opt | null;
  setCorrect: (opt: Opt) => void;
  trackFocus: (key: FieldKey) => {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  };
}

export function OptionsGrid({
  options,
  setOption,
  correct,
  setCorrect,
  trackFocus,
}: OptionsGridProps) {
  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-4">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Step 3: Answer Options
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          Mark Correct Option
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTS.map((opt) => {
          const isSelected = correct === opt;
          return (
            <div
              key={opt}
              className={`p-2.5 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500/70'
                  : 'bg-navy-950 border-steel-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected
                      ? 'bg-emerald-500 text-navy-950'
                      : 'bg-navy-900 text-slate-400 border border-steel-700'
                  }`}
                >
                  Option {opt}
                </span>
                <button
                  type="button"
                  onClick={() => setCorrect(opt)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                    isSelected
                      ? 'text-emerald-400 underline'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected ? '✓ Correct Answer' : 'Mark Correct'}
                </button>
              </div>

              <input
                type="text"
                value={options[opt]}
                onChange={(e) => setOption(opt, e.target.value)}
                {...trackFocus(opt)}
                placeholder={`Option ${opt} text...`}
                className="w-full px-2.5 py-1.5 text-xs rounded bg-navy-900 border border-steel-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}