"use client";

import * as React from "react";
import { isThemeMode, resolveTheme, THEME_STORAGE_KEY, type ThemeMode } from "@/lib/theme";

const CHANGE_EVENT = "earth-theme-change";

function readMode(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

/** Puts the right theme on <html>. Safe to call as often as needed. */
export function applyTheme(mode: ThemeMode): void {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const root = document.documentElement;
  root.setAttribute("data-theme", resolveTheme(mode, systemDark));
  root.setAttribute("data-theme-mode", mode);
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The saved theme mode (system, light or dark) and a function to change it. */
export function useThemeMode(): { mode: ThemeMode; setMode: (mode: ThemeMode) => void } {
  const mode = React.useSyncExternalStore(subscribe, readMode, () => "system" as ThemeMode);

  const setMode = React.useCallback((next: ThemeMode) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private window). The theme still changes for this visit.
    }
    applyTheme(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { mode, setMode };
}
