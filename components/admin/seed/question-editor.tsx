'use client';

import React, { RefObject } from 'react';
import { SYMBOLS } from './data';
import type { FieldKey } from './types';

interface QuestionEditorProps {
  question: string;
  setQuestion: (val: string) => void;
  questionRef: RefObject<HTMLTextAreaElement | null>;
  insertSymbol: (symbol: string) => void;
  trackFocus: (key: FieldKey) => {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  };
}

export function QuestionEditor({
  question,
  setQuestion,
  questionRef,
  insertSymbol,
  trackFocus,
}: QuestionEditorProps) {
  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-3">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Step 2: Question Statement
        </label>
        <span className="text-[10px] font-mono text-slate-400">
          {question.length} chars
        </span>
      </div>

      {/* Math/Symbol Quick Bar */}
      <div className="flex items-center gap-1.5 flex-wrap p-2 rounded bg-navy-950 border border-steel-800">
        <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">
          Symbols:
        </span>
        {SYMBOLS.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => insertSymbol(sym)}
            className="px-2 py-0.5 text-xs font-mono rounded bg-navy-900 border border-steel-700 text-slate-200 hover:bg-steel-700 hover:text-white transition-colors"
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Question Text Area */}
      <textarea
        ref={questionRef}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        {...trackFocus('question')}
        rows={4}
        placeholder="Enter the complete question here... (e.g. Find the value of x when...)"
        className="w-full p-3 text-xs rounded bg-navy-950 border border-steel-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono leading-relaxed"
      />
    </div>
  );
}