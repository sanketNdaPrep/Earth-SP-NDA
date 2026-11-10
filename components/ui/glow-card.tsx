"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMousePosition } from "@/hooks/use-mouse-position";

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: "gold" | "emerald" | "steel";
}

export function GlowCard({ className, accent = "gold", children, ...props }: GlowCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const updateOverlayPosition = React.useCallback(({ x, y }: { x: number; y: number }) => {
    if (!overlayRef.current) return;
    const { width, height } = overlayRef.current.getBoundingClientRect();
    overlayRef.current.style.setProperty("--x", `${x - width / 2}px`);
    overlayRef.current.style.setProperty("--y", `${y - height / 2}px`);
  }, []);

  useMousePosition(containerRef, updateOverlayPosition);

  const glowColor =
    accent === "gold" ? "bg-gold-300" : accent === "emerald" ? "bg-emerald-400" : "bg-steel-300";

  return (
    <div
      ref={containerRef}
      className={cn(
        "group/glow relative flex flex-col overflow-hidden rounded-panel border border-steel-700 bg-navy-900 p-6 shadow-panel select-none",
        className,
      )}
      {...props}
    >
      <div
        ref={overlayRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-0 size-64 rounded-full opacity-0 blur-3xl transition-opacity duration-(--duration-slow) ease-(--ease-standard) group-hover/glow:opacity-15",
          glowColor,
        )}
        style={{ transform: "translate(var(--x, 0px), var(--y, 0px))" }}
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export default GlowCard;