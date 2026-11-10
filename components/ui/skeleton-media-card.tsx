import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton, SkeletonGroup, type SkeletonAnimation } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface SkeletonMediaCardProps {
  /** Announced to screen readers. Default "Loading". */
  label?: string;
  /** Text lines under the title. The last one is shorter. Default 2. */
  lines?: number;
  /** Wrap the tile in a bordered Card. Default false. */
  bordered?: boolean;
  animation?: SkeletonAnimation;
  className?: string;
}

/**
 * Loading placeholder for a tile that leads with an image: 16:9 media block,
 * a short title bar, then text lines. Fills its container; the caller sets the width.
 * Row heights match a text-base title (leading-6) and text-sm lines (leading-5),
 * so the loaded tile does not jump.
 */
export function SkeletonMediaCard({
  label = "Loading",
  lines = 2,
  bordered = false,
  animation,
  className,
}: SkeletonMediaCardProps) {
  const count = Math.max(1, Math.floor(lines));

  const body = (
    <>
      <Skeleton animation={animation} className="aspect-video w-full" />
      <div className="flex flex-col gap-1">
        <div className="flex h-6 items-center">
          <Skeleton animation={animation} className="h-4 w-2/5" />
        </div>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex h-5 items-center">
            <Skeleton
              animation={animation}
              className={cn("h-3.5", i === count - 1 && count > 1 ? "w-3/5" : "w-full")}
            />
          </div>
        ))}
      </div>
    </>
  );

  if (bordered) {
    return (
      <Card className={cn("w-full", className)}>
        <SkeletonGroup label={label} className="flex flex-col gap-3 p-4">
          {body}
        </SkeletonGroup>
      </Card>
    );
  }

  return (
    <SkeletonGroup label={label} className={cn("flex w-full flex-col gap-3", className)}>
      {body}
    </SkeletonGroup>
  );
}

export default SkeletonMediaCard;