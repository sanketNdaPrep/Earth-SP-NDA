"use client";

import { Icons } from "@/components/ui/icons";
import { useThemeMode } from "@/components/theme/use-theme-mode";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/lib/theme";

const ORDER: ThemeMode[] = ["system", "light", "dark"];
const LABEL: Record<ThemeMode, string> = { system: "Same as my phone", light: "Light", dark: "Dark" };

/** One-tap appearance button for pages that have no site menu. Each tap moves to the next choice. */
export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useThemeMode();
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  const Icon = mode === "light" ? Icons.sun : mode === "dark" ? Icons.moon : Icons.monitor;
  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={`Appearance: ${LABEL[mode]}. Switch to ${LABEL[next]}`}
      title={`Appearance: ${LABEL[mode]}`}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-steel-700 text-steel-100 transition-colors hover:border-gold-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400",
        className,
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
