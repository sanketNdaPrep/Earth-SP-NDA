/** Theme settings shared by the page script, the switcher and the tests. */
export const THEME_STORAGE_KEY = "earth-theme";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_MODES: readonly ThemeMode[] = ["system", "light", "dark"];

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

/** What the page should look like for a saved mode and the phone's current setting. */
export function resolveTheme(mode: ThemeMode, systemDark: boolean): ResolvedTheme {
  if (mode === "system") return systemDark ? "dark" : "light";
  return mode;
}

/**
 * Runs in <head> before the page paints, so a light-mode phone never flashes dark first.
 * It must stay self-contained (no imports) because it is inlined as text.
 * Keep it in step with resolveTheme above.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem("${THEME_STORAGE_KEY}");if(m!=="light"&&m!=="dark")m="system";var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var t=m==="system"?(d?"dark":"light"):m;document.documentElement.setAttribute("data-theme",t);document.documentElement.setAttribute("data-theme-mode",m)}catch(e){}})()`;
