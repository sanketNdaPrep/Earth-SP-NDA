'use client';

import React from 'react';
import type { SeedDraft } from './types';

interface DraftBannerProps {
  pendingDraft: SeedDraft | null;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftBanner({ pendingDraft, onRestore, onDiscard }: DraftBannerProps) {
  if (!pendingDraft) return null;

  const formattedTime = new Date(pendingDraft.savedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mb-6 p-4 rounded-lg border border-gold-400/40 bg-gold-400/10 text-gold-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-lg">💾</span>
        <div>
          <p className="font-bold text-xs uppercase tracking-wider text-gold-400">
            Unsaved Local Draft Found
          </p>
          <p className="text-xs text-slate-300">
            Autosaved at {formattedTime}. Would you like to restore your progress?
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRestore}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-gold-400 text-navy-950 hover:bg-gold-300 transition-colors"
        >
          Restore Draft
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-navy-900 border border-steel-700 text-slate-300 hover:bg-navy-800 transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
}