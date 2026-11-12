"use client";

import * as React from "react";
import { useMousePosition } from "@/hooks/use-mouse-position";
import { cn } from "@/lib/utils";

export type GlowAccent = "gold" | "emerald" | "steel" | "danger";

export interface GlowCardProps {
  accent?: GlowAccent;
  className?: string;
  children: React.ReactNode;
}

/**
 * Card with a coloured glow that follows the pointer along its border and reveals a
 * faint grid beneath it. The pointer position is written to --mx / --my (no React
 * state); hover and keyboard focus are handled in CSS. Accent colours are theme tokens.
 */
export function GlowCard({ accent = "gold", className, children }: GlowCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const onMove = React.useCallback(({ x, y }: { x: number; y: number }) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  }, []);

  useMousePosition(ref, onMove);

  const reveal =
    "absolute inset-0 opacity-0 transition-opacity duration-(--duration-slow) ease-(--ease-standard) group-hover/glow:opacity-100 group-focus-within/glow:opacity-100";

  return (
    <div ref={ref} data-accent={accent} className={cn("glow-card group/glow relative rounded-panel", className)}>
      <div aria-hidden="true" className="absolute inset-0 rounded-panel bg-steel-700/60" />
      <div aria-hidden="true" className={cn("glow-card-border rounded-panel", reveal)} />
      <div aria-hidden="true" className="absolute inset-px overflow-hidden rounded-panel bg-navy-900">
        <div className={cn("glow-card-wash", reveal)} />
        <div className={cn("glow-card-grid", reveal)} />
      </div>
      <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">{children}</div>
    </div>
  );
}