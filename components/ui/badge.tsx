import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "gold" | "emerald" | "danger" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-navy-800 text-steel-100 border-steel-700",
  gold: "bg-gold-400/10 text-gold-300 border-gold-400/30",
  emerald: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  danger: "bg-danger-500/10 text-danger-400 border-danger-500/30",
  outline: "border-steel-700 text-steel-300 bg-transparent",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium tracking-wide transition-colors",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export default Badge;