'use client';

import React from 'react';
import { TAXONOMY } from './data';

interface SubjectPickerProps {
  group: string;
  selectGroup: (group: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
}

export function SubjectPicker({
  group,
  selectGroup,
  subject,
  setSubject,
}: SubjectPickerProps) {
  const subjects = TAXONOMY[group] || [];

  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-4">
      <div className="flex items-center justify-between border-b border-steel-700/40 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Step 1: Classification & Context
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          UI Taxonomy Tagging
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Group Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Exam Domain / Stream
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(TAXONOMY).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => selectGroup(g)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  group === g
                    ? 'bg-emerald-500 text-navy-950 shadow'
                    : 'bg-navy-950 border border-steel-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Subject / Topic Area
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded bg-navy-950 border border-steel-700 text-white focus:outline-none focus:border-emerald-400"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}