import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "gold" | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "relative isolate inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-button border border-transparent font-sans font-semibold tracking-normal " +
  "transition-[translate,scale,box-shadow,background-color,border-color,color] duration-(--duration-base) ease-(--ease-standard) " +
  "hover:-translate-y-px active:translate-y-px active:scale-98 active:duration-(--duration-fast) motion-reduce:translate-none motion-reduce:scale-100 motion-reduce:transition-none " +
  // A soft light that sweeps across on hover.
  "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:-translate-x-full after:bg-linear-105 after:from-transparent after:via-white/30 after:to-transparent " +
  "after:transition-transform after:duration-700 hover:after:translate-x-full motion-reduce:after:hidden " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:opacity-50";

const solid = "bg-linear-to-b from-gold-300 via-gold-400 to-gold-400 text-navy-950 shadow-rich hover:shadow-rich-hover";
const quiet = "border-steel-700 bg-linear-to-b from-navy-800 to-navy-900 text-steel-100 shadow-rich-quiet hover:border-gold-400 hover:text-gold-300 hover:shadow-rich-quiet-hover";

const variants: Record<ButtonVariant, string> = {
  primary: solid,
  secondary: quiet,
  ghost: "text-steel-300 hover:bg-navy-800 hover:text-steel-100",
  danger: "border-danger-500/40 bg-danger-500/10 text-danger-400 hover:border-danger-500 hover:bg-linear-to-b hover:from-danger-400 hover:to-danger-500 hover:text-on-danger hover:shadow-rich-danger",
  success: "bg-linear-to-b from-emerald-300 via-emerald-400 to-emerald-400 text-navy-950 shadow-rich-success hover:shadow-rich-success",
  outline: quiet,
  gold: solid,
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-sm",
  md: "h-10 px-4.5 text-sm",
  lg: "h-12 px-6 text-base",
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