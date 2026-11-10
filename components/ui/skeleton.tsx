import * as React from "react";
import { cn } from "@/lib/utils";

export type SkeletonAnimation = "pulse" | "shimmer" | "none";

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** "pulse" (default) fades softly, "shimmer" sweeps a light band, "none" is static. Both stop under reduced motion. */
  animation?: SkeletonAnimation;
}

/**
 * One placeholder block. Size it with className (for example "h-4 w-2/3").
 * Decorative: hidden from screen readers. Put blocks inside a SkeletonGroup,
 * which announces the loading state once.
 */
export function Skeleton({ animation = "pulse", className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-control bg-navy-800",
        animation === "pulse" && "skeleton-pulse",
        animation === "shimmer" && "skeleton-shimmer",
        className,
      )}
      {...props}
    />
  );
}

export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message announced to screen readers, e.g. "Loading mock tests". Default "Loading". */
  label?: string;
}

/**
 * Wraps placeholders so the whole loading area is announced once, not block by block.
 * Render it only while loading and swap it for the real content when ready.
 */
export function SkeletonGroup({ label = "Loading", className, children, ...props }: SkeletonGroupProps) {
  return (
    <div role="status" aria-busy="true" className={className} {...props}>
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}