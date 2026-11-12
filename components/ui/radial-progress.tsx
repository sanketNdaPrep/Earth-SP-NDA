import * as React from "react";
import { cn } from "@/lib/utils";

export type RadialProgressTone = "neutral" | "gold" | "emerald" | "danger";
export type RadialProgressSize = "sm" | "md" | "lg";
export type RadialProgressThickness = "thin" | "regular";

const ARC: Record<RadialProgressTone, string> = {
  neutral: "stroke-steel-300",
  gold: "stroke-gold-400",
  emerald: "stroke-emerald-400",
  danger: "stroke-danger-500",
};

const BOX: Record<RadialProgressSize, string> = {
  sm: "size-16",
  md: "size-24",
  lg: "size-32",
};

const TEXT: Record<RadialProgressSize, string> = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-2xl",
};

// Geometry in a 100 x 100 viewBox. The stroke is centred on the radius, so
// radius + half the widest stroke must stay under 50.
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE: Record<RadialProgressThickness, number> = { thin: 6, regular: 10 };

export interface RadialProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** What is progressing, e.g. "Syllabus covered". Read by screen readers. */
  label?: string;
  /** Current value. Clamped between 0 and max. */
  value: number;
  /** Upper bound. Default 100. */
  max?: number;
  tone?: RadialProgressTone;
  size?: RadialProgressSize;
  thickness?: RadialProgressThickness;
  /** Spoken value when "N%" is not enough, e.g. "12 of 20 questions answered". */
  valueText?: string;
  /** Centre content. Defaults to the percentage. Decorative: screen readers use the label and value. */
  children?: React.ReactNode;
}

function clamp(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), max);
}

/**
 * Circular progress ring. A div with role="progressbar" (name, aria-valuenow, min, max)
 * wrapping a decorative SVG. The arc starts at 12 o'clock and runs clockwise.
 * Server component: no client JS.
 */
export function RadialProgress({
  label = "Progress",
  value,
  max = 100,
  tone = "neutral",
  size = "md",
  thickness = "regular",
  valueText,
  children,
  className,
  ...props
}: RadialProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const current = clamp(value, safeMax);
  const percent = (current / safeMax) * 100;
  const offset = CIRCUMFERENCE * (1 - percent / 100);
  const strokeWidth = STROKE[thickness];

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={current}
      aria-valuetext={valueText ?? (safeMax === 100 ? undefined : `${current} of ${safeMax}`)}
      className={cn("relative inline-flex shrink-0 items-center justify-center", BOX[size], className)}
      {...props}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth={strokeWidth} className="stroke-steel-700" />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn("radial-arc", ARC[tone])}
        />
      </svg>
      <span
        aria-hidden="true"
        className={cn("relative px-2 text-center font-mono font-medium tabular-nums text-white", TEXT[size])}
      >
        {children ?? `${Math.round(percent)}%`}
      </span>
    </div>
  );
}

export default RadialProgress;