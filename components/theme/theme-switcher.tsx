"use client";

import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/ui/icons";
import { useThemeMode } from "@/components/theme/use-theme-mode";
import type { ThemeMode } from "@/lib/theme";

const OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: "system", label: "Same as my phone" },
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
];

/** The appearance choice inside the site menu. The menu stays open so the change is visible at once. */
export function ThemeSwitcher() {
  const { mode, setMode } = useThemeMode();
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">Appearance</p>
      </DropdownMenuLabel>
      {OPTIONS.map((option) => (
        <DropdownMenuItem
          key={option.mode}
          onSelect={(event) => {
            event.preventDefault();
            setMode(option.mode);
          }}
          aria-label={`${option.label}${mode === option.mode ? ", selected" : ""}`}
          className="justify-between"
        >
          <span>{option.label}</span>
          {mode === option.mode ? <Icons.checkCircle className="size-4 text-gold-400" aria-hidden /> : null}
        </DropdownMenuItem>
      ))}
    </>
  );
}
