import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary: "bg-gold-400 text-navy-950 hover:bg-gold-300 font-semibold shadow-panel",
  secondary: "bg-navy-800 text-steel-100 hover:bg-navy-700 border border-steel-700",
  outline: "border border-steel-700 bg-transparent text-steel-100 hover:bg-navy-800",
  ghost: "bg-transparent text-steel-300 hover:bg-navy-800 hover:text-white",
  danger: "bg-danger-500 text-white hover:bg-danger-400 font-semibold",
};

const sizeStyles = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-(--duration-base) ease-(--ease-standard)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/60 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
});

export default Button;