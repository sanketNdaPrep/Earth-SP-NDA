import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "pending" | "approved" | "added" | "edited" | "deleted" | "neutral";

const tones: Record<StatusTone, string> = {
  pending: "bg-gold-400/15 text-gold-300",
  approved: "bg-emerald-400/15 text-emerald-300",
  added: "bg-emerald-400/15 text-emerald-300",
  edited: "bg-sky-300/15 text-sky-300",
  deleted: "bg-danger-500/15 text-danger-400",
  neutral: "bg-navy-800 text-steel-300",
};

/** A rounded status with a dot: Pending, Approved, Added, Edited, Deleted. The meaning stays in the text, not only the colour. */
export function StatusPill({ tone = "neutral", className, children }: { tone?: StatusTone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", tones[tone], className)}>
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** A small rounded tag such as "Physics", "PDF · 4.8 MB" or "NDA · CDS". */
export function TagChip({ accent = false, className, children }: { accent?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        accent ? "border-gold-400/60 text-gold-300" : "border-steel-700 bg-navy-800 text-steel-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
