"use client";

import * as React from "react";
import { applyTheme } from "@/components/theme/use-theme-mode";
import { isThemeMode, THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Keeps the page in step with the phone. When the mode is "system" and the phone switches
 * between light and dark, the site follows straight away. Also follows a change made in another tab.
 * Renders nothing.
 */
export function ThemeSync() {
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const current = () => {
      try {
        const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isThemeMode(saved) ? saved : "system";
      } catch {
        return "system";
      }
    };
    const sync = () => applyTheme(current());
    sync();
    query.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return null;
}
