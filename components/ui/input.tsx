import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-10 w-full rounded-control border border-steel-700 bg-navy-950 px-3 text-sm text-steel-100 placeholder:text-steel-500",
        "transition-colors duration-(--duration-base) ease-(--ease-standard)",
        "focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-500",
        className,
      )}
      {...props}
    />
  );
});