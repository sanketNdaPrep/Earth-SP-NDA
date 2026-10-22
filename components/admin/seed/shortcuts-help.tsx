'use client';

import React from 'react';

export function ShortcutsHelp() {
  const shortcuts = [
    { key: 'Option A–D', action: 'Fill options in order' },
    { key: 'Mark Correct', action: 'Set active key' },
    { key: 'Symbols Bar', action: 'Insert math notation' },
    { key: 'Autosave', action: 'Local browser buffer active' },
  ];

  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-3">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Operator Quick Reference
        </span>
        <span className="text-[10px] font-mono text-slate-400">Tactical Workflow</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {shortcuts.map((sc, i) => (
          <div key={i} className="p-2 rounded bg-navy-950 border border-steel-800 text-xs">
            <span className="block font-mono font-bold text-gold-400 text-[11px]">
              {sc.key}
            </span>
            <span className="text-[10px] text-slate-400">{sc.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}