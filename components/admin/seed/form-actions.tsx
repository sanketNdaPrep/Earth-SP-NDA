'use client';

import React from 'react';

interface FormActionsProps {
  ready: boolean;
  saving: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

export function FormActions({
  ready,
  saving,
  onReset,
  onSubmit,
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-2 border-t border-steel-700/50">
      <button
        type="button"
        onClick={onReset}
        className="px-4 py-2 text-xs font-semibold rounded bg-navy-900 border border-steel-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
      >
        Clear / Reset Form
      </button>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!ready || saving}
        className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-2 ${
          ready && !saving
            ? 'bg-emerald-500 text-navy-950 hover:bg-emerald-400 shadow-lg shadow-emerald-950/50 cursor-pointer'
            : 'bg-steel-800 text-slate-500 border border-steel-700 cursor-not-allowed opacity-60'
        }`}
      >
        {saving ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-navy-950 border-t-transparent animate-spin" />
            Publishing to Supabase...
          </>
        ) : (
          <>
            <span>🚀</span> Publish Question
          </>
        )}
      </button>
    </div>
  );
}