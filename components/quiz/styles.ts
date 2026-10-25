/** Shared class strings. Full class names only, so Tailwind can see every one. */

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400';

export const primaryButton = `inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const ghostButton = `inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-md border border-steel-700 px-4 text-sm font-medium text-steel-100 transition-colors hover:border-steel-500 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`;

export const goldButton = `inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-md border border-gold-400/60 px-4 text-sm font-medium text-gold-300 transition-colors hover:bg-gold-400/10 ${focusRing}`;