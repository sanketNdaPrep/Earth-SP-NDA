'use client';

import React from 'react';
import type { Banner } from './types';

interface StatusBannerProps {
  banner: Banner | null;
  onClose?: () => void;
}

export function StatusBanner({ banner, onClose }: StatusBannerProps) {
  if (!banner) return null;

  const isSuccess = banner.type === 'success';

  return (
    <div
      className={`p-4 rounded-lg border text-sm flex items-start justify-between mb-6 shadow-lg transition-all ${
        isSuccess
          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
          : 'bg-red-950/40 border-red-500/50 text-red-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-base font-bold select-none">
          {isSuccess ? '✓' : '⚠️'}
        </span>
        <div>
          <p className="font-semibold text-xs tracking-wider uppercase mb-0.5">
            {isSuccess ? 'System Notification' : 'Attention Required'}
          </p>
          <p className="text-xs leading-relaxed opacity-90">{banner.text}</p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-mono px-1 py-0.5 rounded"
        >
          [x]
        </button>
      )}
    </div>
  );
}