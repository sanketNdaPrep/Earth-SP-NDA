import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Our names are neutral, gold, emerald, danger, outline and ghost.
 * "secondary" and "destructive" are aliases (neutral and danger) so shadcn-style code still works.
 */
export type BadgeVariant =
  | "neutral"
  | "gold"
  | "emerald"
  | "danger"
  | "outline"
  | "ghost"
  | "secondary"
  | "destructive";

type CoreVariant = "neutral" | "gold" | "emerald" | "danger" | "outline" | "ghost";

const base =
  "inline-flex items-center gap-1 rounded-control px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider";

const variants: Record<CoreVariant, string> = {
  neutral: "bg-navy-800 text-steel-300",
  gold: "bg-gold-400/15 text-gold-300",
  emerald: "bg-emerald-400/15 text-emerald-300",
  danger: "bg-danger-500/15 text-danger-400",
  outline: "border border-steel-700 text-steel-300",
  ghost: "text-steel-300",
};

/** Strong emphasis: solid token fill with near-black text (contrast 5:1 or better). */
const solidVariants: Partial<Record<CoreVariant, string>> = {
  gold: "bg-gold-400 text-navy-950",
  emerald: "bg-emerald-400 text-navy-950",
  danger: "bg-danger-500 text-navy-950",
};

const aliases: Partial<Record<BadgeVariant, CoreVariant>> = {
  secondary: "neutral",
  destructive: "danger",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Solid fill for stronger emphasis. Applies to gold, emerald and danger; ignored by the others. */
  solid?: boolean;
  /** Small leading dot in the badge colour. Decorative, so keep the meaning in the text. */
  dot?: boolean;
}

export function Badge({ className, variant = "neutral", solid = false, dot = false, children, ...props }: BadgeProps) {
  const resolved: CoreVariant = aliases[variant] ?? (variant as CoreVariant);
  const look = (solid && solidVariants[resolved]) || variants[resolved];
  return (
    <span className={cn(base, look, className)} {...props}>
      {dot ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}