import * as React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/** Styled native select (keeps mobile pickers and full keyboard support). */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-control border border-steel-700 bg-navy-950 pr-9 pl-3 text-sm text-steel-100",
          "transition-colors duration-(--duration-base) ease-(--ease-standard)",
          "focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40",
          "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <Icons.chevronRight className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 rotate-90 text-steel-500" />
    </div>
  );
});