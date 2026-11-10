import * as React from "react";
import { cn } from "@/lib/utils";

export type ProgressTone = "neutral" | "gold" | "emerald" | "danger";
export type ProgressSize = "sm" | "md";

const FILL: Record<ProgressTone, string> = {
  neutral: "bg-steel-300",
  gold: "bg-gold-400",
  emerald: "bg-emerald-400",
  danger: "bg-danger-500",
};

const HEIGHT: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
};

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** What is progressing, e.g. "Syllabus covered". Read by screen readers, so it is required. */
  label: string;
  /** Current value. Omit for an indeterminate (loading) bar. Clamped between 0 and max. */
  value?: number;
  /** Upper bound. Default 100. */
  max?: number;
  tone?: ProgressTone;
  size?: ProgressSize;
  /** Show the percentage as text beside the bar (determinate bars only). */
  showValue?: boolean;
}

function clamp(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), max);
}

/**
 * Progress bar. A div with role="progressbar" (fully styleable, unlike the native element)
 * that exposes the same semantics: name, aria-valuenow, aria-valuemin and aria-valuemax.
 * Server component: no client JS.
 */
export function Progress({
  label,
  value,
  max = 100,
  tone = "neutral",
  size = "md",
  showValue = false,
  className,
  ...props
}: ProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const indeterminate = value === undefined;
  const current = indeterminate ? 0 : clamp(value, safeMax);
  const percent = (current / safeMax) * 100;

  return (
    <div className={cn("flex w-full items-center gap-3", className)} {...props}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : current}
        aria-valuetext={indeterminate ? "Loading" : safeMax === 100 ? undefined : `${current} of ${safeMax}`}
        className={cn(
          "relative flex-1 overflow-hidden rounded-control border border-steel-700 bg-navy-800",
          HEIGHT[size],
        )}
      >
        {indeterminate ? (
          <div className={cn("progress-indeterminate absolute inset-y-0 left-0 w-2/5 rounded-control", FILL[tone])} />
        ) : (
          <div
            className={cn("progress-fill h-full rounded-control", FILL[tone])}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
      {showValue && !indeterminate ? (
        // Hidden from screen readers: the progressbar already announces its value.
        <span aria-hidden="true" className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-steel-300">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  );
}

export default Progress;