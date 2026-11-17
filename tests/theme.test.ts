import { describe, expect, it } from "vitest";
import { isThemeMode, resolveTheme, THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from "../lib/theme";

describe("theme", () => {
  it("follows the phone only in system mode", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("accepts only the three modes", () => {
    expect(["system", "light", "dark"].every(isThemeMode)).toBe(true);
    expect(isThemeMode("sepia")).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });
  it("page script reads the same storage key and sets both attributes", () => {
    expect(THEME_INIT_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_INIT_SCRIPT).toContain("data-theme");
    expect(THEME_INIT_SCRIPT).not.toContain("import");
  });
  it("page script gives the same answer as resolveTheme", () => {
    const run = (saved: string | null, systemDark: boolean) => {
      const attrs: Record<string, string> = {};
      const fakeWindow = { matchMedia: () => ({ matches: systemDark }) };
      const fakeDocument = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
      const fakeStorage = { getItem: () => saved };
      new Function("window", "document", "localStorage", THEME_INIT_SCRIPT)(fakeWindow, fakeDocument, fakeStorage);
      return attrs["data-theme"];
    };
    for (const saved of [null, "system", "light", "dark", "junk"] as const) {
      for (const systemDark of [true, false]) {
        const mode = saved === "light" || saved === "dark" ? saved : "system";
        expect(run(saved, systemDark)).toBe(resolveTheme(mode, systemDark));
      }
    }
  });
});
