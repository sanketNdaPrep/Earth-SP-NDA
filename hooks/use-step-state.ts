"use client";

import * as React from "react";

/**
 * Folder levels that behave like real pages.
 *
 * Opening a folder inside a page normally changes only React state, so the browser has one history
 * entry for the whole page and the phone's back gesture leaves the page (often straight to home).
 * `useStepState` adds one history entry per folder level, so back goes up one level at a time.
 * Several steps on the same page are told apart by `key`.
 */
const NS = "__steps";

interface Entry<T> {
  /** How many steps deep this entry is. 0 is the page as it first opened. */
  d: number;
  /** The value shown at this entry. */
  v: T;
  /** The value one step up, so a Back button knows whether history.back() lands on its parent. */
  p: T;
}

function readEntry<T>(key: string): Entry<T> | undefined {
  const state = window.history.state as Record<string, Record<string, Entry<T>> | undefined> | null;
  return state?.[NS]?.[key];
}

export function useStepState<T>(initial: T, key: string) {
  const [value, setValue] = React.useState<T>(initial);
  const valueRef = React.useRef(value);
  const initialRef = React.useRef(initial);
  const depth = React.useRef(0);

  React.useEffect(() => {
    const onPop = () => {
      const entry = readEntry<T>(key);
      depth.current = entry?.d ?? 0;
      const next = entry ? entry.v : initialRef.current;
      valueRef.current = next;
      setValue(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [key]);

  /** Moves down (or sideways) and adds a history entry, so Back returns here. */
  const push = React.useCallback(
    (next: T) => {
      const previous = valueRef.current;
      depth.current += 1;
      const all = ((window.history.state as Record<string, unknown> | null)?.[NS] ?? {}) as Record<string, Entry<T>>;
      window.history.pushState({ [NS]: { ...all, [key]: { d: depth.current, v: next, p: previous } satisfies Entry<T> } }, "");
      valueRef.current = next;
      setValue(next);
    },
    [key],
  );

  /** Goes up to `parent`. Uses real history when the previous entry is that parent, so the stack does not grow. */
  const up = React.useCallback(
    (parent: T) => {
      const here = readEntry<T>(key);
      if (depth.current > 0 && here && JSON.stringify(here.p) === JSON.stringify(parent)) {
        window.history.back();
        return;
      }
      push(parent);
    },
    [key, push],
  );

  return [value, push, up] as const;
}

/**
 * A popup (picture viewer, dialog) that the phone's back gesture closes instead of leaving the page.
 * Opening adds one history entry; closing with the button removes it again.
 */
export function useBackToClose(open: boolean, onClose: () => void) {
  const pushed = React.useRef(false);
  const close = React.useRef(onClose);
  React.useEffect(() => {
    close.current = onClose;
  });

  React.useEffect(() => {
    if (!open) return;
    window.history.pushState({ [NS]: { popup: { d: 1, v: true, p: false } } }, "");
    pushed.current = true;
    const onPop = () => {
      pushed.current = false;
      close.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  // Closed with the button: take the entry we added off the stack again.
  React.useEffect(() => {
    if (!open && pushed.current) {
      pushed.current = false;
      window.history.back();
    }
  }, [open]);
}
