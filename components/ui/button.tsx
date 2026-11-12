import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "gold";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-mono font-semibold uppercase tracking-wider " +
  "transition-colors duration-(--duration-base) ease-(--ease-standard) " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gold-400 text-navy-950 hover:bg-gold-300",
  secondary: "border border-steel-700 bg-navy-900 text-steel-100 hover:border-steel-500 hover:bg-navy-800",
  ghost: "text-steel-300 hover:bg-navy-800 hover:text-steel-100",
  danger: "bg-danger-500 text-steel-100 hover:bg-danger-400",
  outline: "border border-steel-700 bg-navy-900 text-steel-100 hover:border-steel-500 hover:bg-navy-800",
  gold: "bg-gold-400 text-navy-950 hover:bg-gold-300",
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