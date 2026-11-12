import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Project-aware tailwind-merge: teaches it our custom theme tokens so that
 * conflicting utilities (e.g. `rounded-md` vs `rounded-control`) resolve correctly.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["control", "panel"],
      shadow: ["panel", "glow"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}