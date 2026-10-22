'use client';

import React from 'react';
import type { SeedMode } from './types';

export const PANEL_ID = 'seed-mode-panel';

export function tabId(mode: SeedMode): string {
  return `seed-tab-${mode}`;
}

interface ModeTabsProps {
  mode: SeedMode;
  setMode: (mode: SeedMode) => void;
  bankCount: number;
}

export function ModeTabs({ mode, setMode, bankCount }: ModeTabsProps) {
  const tabs: { id: SeedMode; label: string; icon: string; count?: number }[] = [
    { id: 'single', label: 'Single Entry', icon: '✍️' },
    { id: 'bulk', label: 'Bulk Parser', icon: '⚡' },
    { id: 'bank', label: 'Module Questions', icon: '📚', count: bankCount },
  ];

  return (
    <div
      role="tablist"
      aria-label="Seeding mode selection"
      className="flex items-center gap-1 p-1 rounded-lg bg-navy-900 border border-steel-700/80 mb-6"
    >
      {tabs.map((tab) => {
        const isActive = mode === tab.id;
        return (
          <button
            key={tab.id}
            id={tabId(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-controls={PANEL_ID}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              isActive
                ? 'bg-emerald-500 text-navy-950 shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-navy-950/60'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isActive
                    ? 'bg-navy-950 text-emerald-400'
                    : 'bg-navy-950 text-slate-400 border border-steel-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}