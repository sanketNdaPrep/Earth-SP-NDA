"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadialProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  progress?: number;
  percentage?: number;
  size?: "sm" | "md" | "lg" | number;
  thickness?: string | number;
  strokeWidth?: number;
  showValue?: boolean;
  color?: string;
  caption?: string;
  label?: string;
  tone?: string;
  valueText?: string;
  max?: number;
}

export function RadialProgress({
  value,
  progress,
  percentage,
  size = "md",
  strokeWidth = 8,
  thickness,
  showValue = false,
  color,
  caption,
  label,
  tone,
  valueText,
  max = 100,
  className,
  children,
  ...props
}: RadialProgressProps) {
  const actualValue = value ?? progress ?? percentage ?? 0;
  const actualStrokeWidth = typeof thickness === "number" ? thickness : strokeWidth;
  const numericSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 64
      : size === "lg"
      ? 128
      : 96;

  const radius = (numericSize - actualStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (actualValue / max) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: numericSize, height: numericSize }}
      {...props}
    >
      <svg width={numericSize} height={numericSize} className="-rotate-90 transform">
        <circle
          cx={numericSize / 2}
          cy={numericSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={actualStrokeWidth}
          className="text-navy-800"
          fill="transparent"
        />
        <circle
          cx={numericSize / 2}
          cy={numericSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={actualStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("text-gold-400 transition-all duration-500 ease-out", color)}
          fill="transparent"
        />
      </svg>
      {(showValue || children || valueText) && (
        <div className="absolute flex flex-col items-center justify-center font-mono text-sm font-bold text-white">
          {children || valueText || `${Math.round(actualValue)}%`}
          {label && <span className="text-[10px] text-steel-400 font-sans">{label}</span>}
        </div>
      )}
    </div>
  );
}