'use client';

import React from 'react';
import { RESOURCE_CATEGORIES } from './data';

interface ResourceLinkProps {
  resTitle: string;
  setResTitle: (val: string) => void;
  resUrl: string;
  setResUrl: (val: string) => void;
  resSize: string;
  setResSize: (val: string) => void;
  resCategory: string;
  setResCategory: (val: string) => void;
}

export function ResourceLink({
  resTitle,
  setResTitle,
  resUrl,
  setResUrl,
  resSize,
  setResSize,
  resCategory,
  setResCategory,
}: ResourceLinkProps) {
  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-4">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Step 5: Attach Resource Link (Vault Storage)
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          Optional PDF / Cheat Sheet
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Resource Title
          </label>
          <input
            type="text"
            value={resTitle}
            onChange={(e) => setResTitle(e.target.value)}
            placeholder="e.g. Formula Sheet PDF"
            className="w-full px-3 py-1.5 text-xs rounded bg-navy-950 border border-steel-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Download URL
          </label>
          <input
            type="url"
            value={resUrl}
            onChange={(e) => setResUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-1.5 text-xs rounded bg-navy-950 border border-steel-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Resource Vault Category
          </label>
          <select
            value={resCategory}
            onChange={(e) => setResCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded bg-navy-950 border border-steel-700 text-white focus:outline-none focus:border-emerald-400"
          >
            {RESOURCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            File Size Display
          </label>
          <input
            type="text"
            value={resSize}
            onChange={(e) => setResSize(e.target.value)}
            placeholder="e.g. 2.4 MB"
            className="w-full px-3 py-1.5 text-xs rounded bg-navy-950 border border-steel-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
          />
        </div>
      </div>
    </div>
  );
}