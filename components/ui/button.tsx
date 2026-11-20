import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "gold";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-mono font-semibold uppercase tracking-wider " +
  "transition-[translate,scale,box-shadow,background-color,border-color,color,filter] duration-(--duration-base) ease-(--ease-standard) " +
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-98 active:duration-(--duration-fast) " +
  "motion-reduce:translate-none motion-reduce:scale-100 motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:opacity-50";

const solid = "bg-linear-to-b from-gold-300 to-gold-400 text-navy-950 shadow-button hover:shadow-button-lift hover:brightness-105 active:brightness-95";
const soft =
  "border border-steel-700 bg-linear-to-b from-navy-800 to-navy-900 text-steel-100 shadow-button-soft " +
  "hover:border-steel-500 hover:shadow-button-soft-lift hover:text-white";

const variants: Record<ButtonVariant, string> = {
  primary: solid,
  secondary: soft,
  ghost: "text-steel-300 hover:-translate-y-0 hover:bg-navy-800 hover:text-steel-100 active:bg-navy-900",
  danger: "bg-danger-500 text-on-danger shadow-button-soft hover:shadow-button-soft-lift hover:brightness-110",
  outline: soft,
  gold: solid,
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "size-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  /** Render as the child element (e.g. a Next.js <Link>) instead of a <button>. */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading = false, asChild = false, disabled, children, type, ...props },
  ref,
) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (asChild) {
    return (
      <Slot ref={ref} className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Icons.spinner className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
});