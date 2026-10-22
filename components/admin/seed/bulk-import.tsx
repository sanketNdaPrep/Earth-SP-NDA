'use client';

import React, { useRef } from 'react';
import { BULK_SAMPLE } from './data';
import type { BulkImport } from './use-bulk-import';

interface BulkImportPanelProps {
  bulk: BulkImport;
}

export function BulkImportPanel({ bulk }: BulkImportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    void bulk.loadFile(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-steel-700/40 pb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Bulk Batch Question Importer
            </h2>
            <p className="text-[11px] text-slate-400">
              Paste formatted text or upload a JSON/TXT file to seed up to 200 questions at once.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.text"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-navy-950 border border-steel-700 text-slate-300 hover:text-white transition-colors"
            >
              📁 Load File
            </button>
            <button
              type="button"
              onClick={() => bulk.setText(BULK_SAMPLE)}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-navy-950 border border-steel-700 text-gold-400 hover:border-gold-400/50 transition-colors"
            >
              ⚡ Insert Sample
            </button>
          </div>
        </div>

        {bulk.fileName && (
          <div className="flex items-center justify-between p-2 rounded bg-navy-950 border border-steel-800 text-xs">
            <span className="font-mono text-slate-300">File: {bulk.fileName}</span>
            <button
              type="button"
              onClick={bulk.clear}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              Clear
            </button>
          </div>
        )}

        <textarea
          value={bulk.text}
          onChange={(e) => bulk.setText(e.target.value)}
          rows={12}
          placeholder="Paste bulk questions here using Q:, A:, B:, C:, D:, Ans:, Exp: format..."
          className="w-full p-3 text-xs rounded bg-navy-950 border border-steel-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={bulk.skipDuplicates}
              onChange={(e) => bulk.setSkipDuplicates(e.target.checked)}
              className="rounded border-steel-700 bg-navy-950 text-emerald-400 focus:ring-0"
            />
            <span>Skip duplicate questions already in this module ({bulk.duplicates.length})</span>
          </label>

          <button
            type="button"
            onClick={bulk.runImport}
            disabled={bulk.importing || bulk.toImport.length === 0}
            className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              bulk.toImport.length > 0 && !bulk.importing
                ? 'bg-emerald-500 text-navy-950 hover:bg-emerald-400 shadow-lg cursor-pointer'
                : 'bg-steel-800 text-slate-500 border border-steel-700 cursor-not-allowed opacity-60'
            }`}
          >
            {bulk.importing
              ? 'Importing Batch...'
              : `Import ${bulk.toImport.length} Valid Questions`}
          </button>
        </div>
      </div>

      {/* Problems / Validation output */}
      {bulk.parsed.problems.length > 0 && (
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-500/40 space-y-2">
          <p className="text-xs font-bold uppercase text-red-400">
            Parser Warnings & Problems ({bulk.parsed.problems.length})
          </p>
          <ul className="space-y-1 max-h-40 overflow-y-auto text-xs font-mono text-red-300">
            {bulk.parsed.problems.map((p, idx) => (
              <li key={idx}>
                • {p.index > 0 ? `Item #${p.index}: ` : ''}
                {p.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}