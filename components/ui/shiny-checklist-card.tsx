"use client";

import * as React from "react";
import { Icons } from "@/components/ui/icons";
import { useMousePosition } from "@/hooks/use-mouse-position";
import { cn } from "@/lib/utils";

export interface ChecklistStep {
  title: string;
  /** Short duration or note shown on the right, for example "25m". */
  time: string;
  /** Defaults to true. Pass false for a step still to do. */
  done?: boolean;
}

const DEFAULT_STEPS: ChecklistStep[] = [
  { title: "Algebra drill", time: "25m", done: true },
  { title: "GAT mock test", time: "45m", done: true },
  { title: "Review mistakes", time: "20m", done: false },
];

export interface ShinyChecklistCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  steps?: ChecklistStep[];
}

/** Checklist card with a soft gold glow that follows the mouse while hovering. */
export function ShinyChecklistCard({
  className,
  title = "Daily mission",
  subtitle = "Today, 3 tasks",
  steps = DEFAULT_STEPS,
}: ShinyChecklistCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const updateOverlayPosition = React.useCallback(({ x, y }: { x: number; y: number }) => {
    if (!overlayRef.current) return;

    const { width, height } = overlayRef.current.getBoundingClientRect();
    overlayRef.current.style.setProperty("--x", `${x - width / 2}px`);
    overlayRef.current.style.setProperty("--y", `${y - height / 2}px`);
  }, []);

  useMousePosition(containerRef, updateOverlayPosition);

  return (
    <div
      ref={containerRef}
      data-shiny="card"
      className={cn(
        "group/shiny relative w-96 max-w-full overflow-hidden rounded-panel border border-steel-700 bg-navy-900 p-6 text-steel-100 shadow-panel select-none",
        className,
      )}
    >
      {/* Decorative glow. top-0 left-0 anchors it to the card corner so the offset maths is exact. */}
      <div
        ref={overlayRef}
        data-shiny="glow"
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-0 size-64 rounded-full bg-gold-300 opacity-0 blur-3xl transition-opacity duration-(--duration-slow) ease-(--ease-standard) group-hover/shiny:opacity-15"
        style={{ transform: "translate(var(--x, 0px), var(--y, 0px))" }}
      />

      <div className="relative z-10">
        <h3 className="font-mono text-sm font-semibold tracking-tight text-white">{title}</h3>
        <p className="text-xs text-steel-300">{subtitle}</p>
      </div>

      <ol className="relative z-10 mt-8 flex flex-col gap-2.5 rounded-panel border border-steel-700 bg-navy-950/60 p-4 shadow-inner">
        {steps.map((step) => {
          const done = step.done ?? true;
          return (
            <li key={step.title} className="flex items-center gap-3">
              {done ? (
                <Icons.checkCircle className="size-5 shrink-0 text-emerald-400" />
              ) : (
                <span aria-hidden="true" className="size-5 shrink-0 rounded-full border-2 border-steel-500" />
              )}
              <span className="text-xs font-medium text-steel-100 md:text-sm">
                <span className="sr-only">{done ? "Completed: " : "To do: "}</span>
                {step.title}
              </span>
              <span className="ml-auto shrink-0 font-mono text-xs text-steel-300">{step.time}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default ShinyChecklistCard;