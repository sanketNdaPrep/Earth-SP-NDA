import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton, SkeletonGroup, type SkeletonAnimation } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Line widths cycle so stacked bars look like real text rather than a uniform block.
const LINE_WIDTHS = ["w-1/2", "w-3/4", "w-2/3", "w-5/6"] as const;

export interface SkeletonCardProps {
  /** Announced to screen readers. Default "Loading". */
  label?: string;
  /** Header lines: the first is a title, the rest are description lines. Default 2. */
  lines?: number;
  /** Show the 16:9 media block under the header. Default true. */
  media?: boolean;
  animation?: SkeletonAnimation;
  className?: string;
}

/**
 * Loading placeholder for a card with a title, description and an image.
 * Fills its container; the caller sets the width. Header row heights match a
 * text-base title and text-sm description so the loaded card does not jump.
 */
export function SkeletonCard({ label = "Loading", lines = 2, media = true, animation, className }: SkeletonCardProps) {
  const count = Math.max(1, Math.floor(lines));
  return (
    <Card className={cn("w-full", className)}>
      <SkeletonGroup label={label}>
        <CardHeader>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className={cn("flex items-center", i === 0 ? "h-6" : "h-5")}>
              <Skeleton
                animation={animation}
                className={cn(i === 0 ? "h-4" : "h-3.5", LINE_WIDTHS[i % LINE_WIDTHS.length])}
              />
            </div>
          ))}
        </CardHeader>
        {media ? (
          <CardContent>
            <Skeleton animation={animation} className="aspect-video w-full" />
          </CardContent>
        ) : null}
      </SkeletonGroup>
    </Card>
  );
}

export interface SkeletonListProps {
  label?: string;
  /** Number of rows. Default 4. */
  rows?: number;
  animation?: SkeletonAnimation;
  className?: string;
}

/** Loading placeholder for a list of rows, each with a square thumbnail and two text lines. */
export function SkeletonList({ label = "Loading", rows = 4, animation, className }: SkeletonListProps) {
  const count = Math.max(1, Math.floor(rows));
  return (
    <SkeletonGroup label={label} className={cn("flex flex-col gap-4", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton animation={animation} className="size-10 shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton animation={animation} className={cn("h-4", LINE_WIDTHS[i % LINE_WIDTHS.length])} />
            <Skeleton animation={animation} className="h-3.5 w-1/3" />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export interface SkeletonTextProps {
  label?: string;
  /** Number of lines. The last line is shorter. Default 3. */
  lines?: number;
  animation?: SkeletonAnimation;
  className?: string;
}

/** Loading placeholder for a paragraph of text. */
export function SkeletonText({ label = "Loading", lines = 3, animation, className }: SkeletonTextProps) {
  const count = Math.max(1, Math.floor(lines));
  return (
    <SkeletonGroup label={label} className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          animation={animation}
          className={cn("h-3.5", i === count - 1 && count > 1 ? "w-3/5" : "w-full")}
        />
      ))}
    </SkeletonGroup>
  );
}

export default SkeletonCard;