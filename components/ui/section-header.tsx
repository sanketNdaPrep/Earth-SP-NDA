import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  /** Small spaced label above the title, for example "Knowledge vaults". */
  label?: string;
  /** Section number shown before the label as "04 // LABEL". */
  number?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** A button or link shown beside the title. */
  action?: React.ReactNode;
  /** Small caption on the right, for example "486 files". */
  aside?: React.ReactNode;
  /** Heading level. Default is h2. */
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/** The standard section opener: spaced label, big title, one line of description, optional action. */
export function SectionHeader({ label, number, title, description, action, aside, as: Heading = "h2", className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="min-w-0 max-w-3xl space-y-2">
        {label ? (
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gold-300">{number ? `${number} // ${label}` : label}</p>
        ) : null}
        <Heading className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</Heading>
        {description ? <p className="text-pretty text-base leading-relaxed text-steel-300">{description}</p> : null}
      </div>
      {action || aside ? (
        <div className="flex shrink-0 items-center gap-4">
          {aside ? <span className="text-xs font-semibold uppercase tracking-widest text-steel-500">{aside}</span> : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
