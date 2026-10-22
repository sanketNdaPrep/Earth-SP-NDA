'use client';

import React from 'react';
import type { ModuleQuestion } from './types';

interface ExistingQuestionsProps {
  items: ModuleQuestion[];
  state: 'loading' | 'ready' | 'error';
  onRefresh: () => void;
}

export function ExistingQuestions({ items, state, onRefresh }: ExistingQuestionsProps) {
  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 space-y-4">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Module Question Bank ({items.length})
          </h2>
          <p className="text-[11px] text-slate-400">
            Stored questions linked to the active module ID
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-3 py-1.5 text-xs font-mono rounded bg-navy-950 border border-steel-700 text-slate-300 hover:text-white transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {state === 'loading' && (
        <div className="p-8 text-center text-xs font-mono text-slate-400">
          Loading module question inventory...
        </div>
      )}

      {state === 'error' && (
        <div className="p-4 rounded bg-red-950/40 border border-red-500/40 text-xs font-mono text-red-300 text-center">
          Failed to load questions from database.
        </div>
      )}

      {state === 'ready' && items.length === 0 && (
        <div className="p-8 text-center text-xs font-mono text-slate-500">
          No questions in this module yet. Use Single Entry or Bulk Parser to add some.
        </div>
      )}

      {state === 'ready' && items.length > 0 && (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {items.map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-3 rounded bg-navy-950 border border-steel-800 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono font-bold text-emerald-400">
                  #{q.position ?? idx + 1}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Correct: Option {q.correct_option}
                </span>
              </div>

              <p className="font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                {q.question_text}
              </p>

              {q.explanation && (
                <p className="text-[11px] font-mono text-slate-400 border-t border-steel-800/80 pt-2">
                  <strong className="text-slate-300">Solution:</strong> {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}