import * as React from "react";
import { cn } from "@/lib/utils";

export interface BorderBeamProps {
  duration?: number;
  size?: number;
  delay?: number;
  reverse?: boolean;
  className?: string;
}

export function BorderBeam({ duration = 6, size = 120, delay = 0, reverse = false, className }: BorderBeamProps) {
  return (
    <div aria-hidden="true" className="beam-ring">
      <div
        className={cn(
          "beam-dot bg-linear-to-l from-transparent via-gold-400 to-transparent",
          reverse && "beam-dot--reverse",
          className,
        )}
        style={
          {
            "--beam-size": `${size}px`,
            "--beam-duration": `${duration}s`,
            "--beam-delay": `${delay}s`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}