'use client';

import React from 'react';
import { OPTS } from './data';
import type { Opt, OptionsMap } from './types';

interface PreviewCardProps {
  group: string;
  subject: string;
  question: string;
  options: OptionsMap;
  correct: Opt | null;
  explanation: string;
  previewPick: Opt | null;
  setPreviewPick: (opt: Opt) => void;
  reveal: boolean;
  setReveal: (show: boolean) => void;
}

export function PreviewCard({
  group,
  subject,
  question,
  options,
  correct,
  explanation,
  previewPick,
  setPreviewPick,
  reveal,
  setReveal,
}: PreviewCardProps) {
  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-4">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Cadet Live Student View
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-gold-400/20 text-gold-400 border border-gold-400/30">
            Interactive Test Drive
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {group} / {subject}
        </span>
      </div>

      {/* Question Text Preview */}
      <div className="p-3 rounded bg-navy-950 border border-steel-800">
        <p className="text-xs text-white font-mono leading-relaxed whitespace-pre-wrap">
          {question.trim() || 'Your question text will appear here...'}
        </p>
      </div>

      {/* Interactive Options Preview */}
      <div className="space-y-2">
        {OPTS.map((opt) => {
          const text = options[opt];
          const isPicked = previewPick === opt;
          const isActualCorrect = correct === opt;

          let btnStyle = 'bg-navy-950 border-steel-800 text-slate-300 hover:border-slate-600';
          if (reveal) {
            if (isActualCorrect) {
              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
            } else if (isPicked && !isActualCorrect) {
              btnStyle = 'bg-red-950/60 border-red-500 text-red-300';
            }
          } else if (isPicked) {
            btnStyle = 'bg-slate-800 border-slate-500 text-white font-bold';
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => setPreviewPick(opt)}
              className={`w-full p-2.5 text-left text-xs rounded border transition-all flex items-center gap-3 ${btnStyle}`}
            >
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-navy-900 border border-steel-700 text-slate-300">
                {opt}
              </span>
              <span className="font-mono flex-1">{text || `Option ${opt}...`}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Solution Reveal */}
      <div className="flex items-center justify-between pt-2 border-t border-steel-800">
        <button
          type="button"
          onClick={() => setReveal(!reveal)}
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          {reveal ? '🙈 Hide Solution' : '👁️ Test Reveal Solution'}
        </button>

        {reveal && (
          <span className="text-xs font-mono text-emerald-400">
            Correct Option: {correct ?? 'None Marked'}
          </span>
        )}
      </div>

      {reveal && explanation.trim() && (
        <div className="p-3 rounded bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 font-mono leading-relaxed">
          <p className="font-bold text-[10px] uppercase text-emerald-400 mb-1">
            Solution Explanation:
          </p>
          {explanation}
        </div>
      )}
    </div>
  );
}