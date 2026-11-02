'use client';

import { useRef, type KeyboardEvent } from 'react';
import { focusRing } from '@/components/quiz/styles';
import type { FilterKey } from './types';

export interface FilterTab {
  key: FilterKey;
  label: string;
  count: number;
  disabled: boolean;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  active: FilterKey;
  onChange: (key: FilterKey) => void;
  panelId: string;
}

export const tabId = (key: FilterKey) => `filter-tab-${key}`;

/** WAI-ARIA tabs: arrow keys move between tabs, Home and End jump to the ends. */
export function FilterTabs({ tabs, active, onChange, panelId }: FilterTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const enabled = tabs.filter((tab) => !tab.disabled);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = enabled.findIndex((tab) => tab.key === active);
    let target = -1;
    if (event.key === 'ArrowRight') target = (index + 1) % enabled.length;
    else if (event.key === 'ArrowLeft') target = (index - 1 + enabled.length) % enabled.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = enabled.length - 1;
    if (target === -1) return;
    event.preventDefault();
    const next = enabled[target];
    onChange(next.key);
    listRef.current?.querySelector<HTMLButtonElement>(`#${tabId(next.key)}`)?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Filter questions"
      onKeyDown={onKeyDown}
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            id={tabId(tab.key)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            aria-disabled={tab.disabled || undefined}
            disabled={tab.disabled}
            tabIndex={selected ? 0 : -1}
            title={tab.disabled ? 'Needs the answers saved on the device where the test was taken' : undefined}
            onClick={() => onChange(tab.key)}
            className={`inline-flex min-h-11 shrink-0 touch-manipulation items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${focusRing} ${
              selected
                ? 'border-emerald-400 bg-emerald-400 text-navy-950'
                : 'border-steel-700 text-steel-100 hover:border-steel-500 hover:bg-white/5'
            }`}
          >
            {tab.label}
            <span
              className={`rounded px-1.5 text-xs font-semibold tabular-nums ${
                selected ? 'bg-navy-950/20 text-navy-950' : 'bg-navy-950 text-steel-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}