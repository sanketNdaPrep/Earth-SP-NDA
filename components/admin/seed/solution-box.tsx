'use client';

import React from 'react';
import type { FieldKey } from './types';

interface SolutionBoxProps {
  explanation: string;
  setExplanation: (val: string) => void;
  trackFocus: (key: FieldKey) => {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  };
}

export function SolutionBox({
  explanation,
  setExplanation,
  trackFocus,
}: SolutionBoxProps) {
  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-3">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Step 4: Solution & Explanation (Optional)
        </label>
        <span className="text-[10px] font-mono text-slate-400">
          {explanation.length} chars
        </span>
      </div>

      <textarea
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        {...trackFocus('explanation')}
        rows={3}
        placeholder="Provide step-by-step reasoning, formulas, or rules used to arrive at the correct option..."
        className="w-full p-3 text-xs rounded bg-navy-950 border border-steel-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono leading-relaxed"
      />
    </div>
  );
}