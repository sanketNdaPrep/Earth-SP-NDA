'use client';

import React from 'react';
import { QUIZ_CATEGORIES } from './data';
import type { Quiz } from './types';

interface ModuleBarProps {
  quizzes: Quiz[];
  quizId: string;
  setQuizId: (id: string) => void;
  showNewModule: boolean;
  setShowNewModule: (show: boolean) => void;
  newTitle: string;
  setNewTitle: (title: string) => void;
  newCategory: string;
  setNewCategory: (cat: string) => void;
  newDescription: string;
  setNewDescription: (desc: string) => void;
  newTimeLimit: number;
  setNewTimeLimit: (limit: number) => void;
  creatingModule: boolean;
  onCreateModule: () => void;
}

export function ModuleBar({
  quizzes,
  quizId,
  setQuizId,
  showNewModule,
  setShowNewModule,
  newTitle,
  setNewTitle,
  newCategory,
  setNewCategory,
  newDescription,
  setNewDescription,
  newTimeLimit,
  setNewTimeLimit,
  creatingModule,
  onCreateModule,
}: ModuleBarProps) {
  return (
    <div className="p-4 rounded-lg bg-navy-900 border border-steel-700/60 mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-steel-700/40 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Test Module Target
          </span>
          <p className="text-[11px] text-slate-400">
            Select an existing module or create a new test set
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModule(!showNewModule)}
          className="px-3 py-1.5 text-xs font-semibold rounded bg-navy-950 border border-steel-700 text-gold-400 hover:border-gold-400/50 transition-colors self-start sm:self-auto"
        >
          {showNewModule ? '✕ Cancel' : '+ Create New Module'}
        </button>
      </div>

      {/* Module Selector */}
      {!showNewModule && (
        <div className="flex items-center gap-3">
          <select
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded bg-navy-950 border border-steel-700 text-white focus:outline-none focus:border-emerald-400 font-mono"
          >
            {quizzes.length === 0 ? (
              <option value="">No modules found — create one first</option>
            ) : (
              quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  [{q.category}] {q.title}
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {/* Inline Create Form */}
      {showNewModule && (
        <div className="p-3 rounded bg-navy-950 border border-gold-400/30 space-y-3">
          <p className="text-xs font-bold uppercase text-gold-400">
            New Quiz / Module Setup
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Module Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Vector Algebra Practice Drill #1"
                className="w-full px-3 py-1.5 text-xs rounded bg-navy-900 border border-steel-700 text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Category / Exam
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded bg-navy-900 border border-steel-700 text-white focus:outline-none focus:border-gold-400"
              >
                {QUIZ_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                value={newTimeLimit}
                onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                min={1}
                max={180}
                className="w-full px-3 py-1.5 text-xs rounded bg-navy-900 border border-steel-700 text-white focus:outline-none focus:border-gold-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Brief summary..."
                className="w-full px-3 py-1.5 text-xs rounded bg-navy-900 border border-steel-700 text-white placeholder-slate-500 focus:outline-none focus:border-gold-400 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onCreateModule}
              disabled={creatingModule || !newTitle.trim()}
              className="px-4 py-1.5 text-xs font-bold rounded bg-gold-400 text-navy-950 hover:bg-gold-300 disabled:opacity-50 transition-colors"
            >
              {creatingModule ? 'Creating Module...' : 'Save & Select Module'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}