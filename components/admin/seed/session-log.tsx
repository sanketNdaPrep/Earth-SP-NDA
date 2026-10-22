'use client';

import React from 'react';
import type { SessionEntry } from './types';

interface SessionLogProps {
  session: SessionEntry[];
}

export function SessionLog({ session }: SessionLogProps) {
  if (session.length === 0) return null;

  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-3">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Current Session Activity Log
        </span>
        <span className="text-[10px] font-mono text-emerald-400">
          {session.length} Added
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {session.map((entry, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded bg-navy-950 border border-steel-800 flex items-start justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gold-400">
                  #{entry.n}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {entry.topic}
                </span>
              </div>
              <p className="text-slate-300 font-mono truncate">{entry.text}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
              {new Date(entry.at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}