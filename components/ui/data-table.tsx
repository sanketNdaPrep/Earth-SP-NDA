import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Tables for the admin: a rounded frame that scrolls sideways on a phone, a sticky heading, soft zebra rows,
 * a warm highlight on hover and a gold edge on a ticked row. Follows the dark and light themes through the tokens.
 */

export function TableShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-x-auto rounded-panel border border-steel-700 bg-navy-900 shadow-panel", className)}>{children}</div>
  );
}

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(function Table({ className, ...props }, ref) {
  return <table ref={ref} className={cn("w-full min-w-lg border-separate border-spacing-0 text-left text-sm", className)} {...props} />;
});

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("sticky top-0 z-10", className)} {...props} />;
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn(className)} {...props} />;
}

export function Th({ className, scope = "col", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn(
        "border-b border-steel-700 bg-navy-800 px-4 py-3 font-mono text-xs font-semibold tracking-wider whitespace-nowrap text-steel-500 uppercase first:rounded-tl-panel last:rounded-tr-panel",
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, selected, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }) {
  return (
    <tr
      data-selected={selected ? "" : undefined}
      className={cn("group transition-colors duration-(--duration-base) even:bg-steel-100/2 hover:bg-gold-400/6 data-selected:bg-gold-400/10", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-l-3 border-b-steel-700/50 border-l-transparent px-4 py-3.5 align-middle first:border-l-transparent group-data-selected:first:border-l-gold-400 [&:not(:first-child)]:border-l-0",
        className,
      )}
      {...props}
    />
  );
}

/** Edit / delete buttons at the end of a row. Dim until the row is hovered or focused, always readable on a phone. */
export function RowActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-end gap-1.5 opacity-70 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-data-selected:opacity-100", className)}
      {...props}
    />
  );
}
