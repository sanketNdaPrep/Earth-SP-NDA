import * as React from "react";
import { cn } from "@/lib/utils";

export type InlinePillTone = "neutral" | "gold" | "emerald";

export interface InlinePillProps {
  label: string;
  icon: React.ReactNode;
  tone?: InlinePillTone;
  suffix?: string;
}

export function InlinePill({ label, icon, tone = "neutral", suffix }: InlinePillProps) {
  return (
    <span className="whitespace-nowrap">
      <span className={cn("inline-pill", `inline-pill-${tone}`)}>
        <span aria-hidden="true" className="inline-pill-icon">
          {icon}
        </span>
        {label}
      </span>
      {suffix}
    </span>
  );
}

export interface HeroCenteredProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  heading: React.ReactNode;
  headingLevel?: "h1" | "h2";
  description?: React.ReactNode;
  actions?: React.ReactNode;
  note?: React.ReactNode;
  grid?: boolean;
}

export function HeroCentered({
  heading,
  headingLevel = "h1",
  description,
  actions,
  note,
  grid = false,
  className,
  ...props
}: HeroCenteredProps) {
  const titleId = React.useId();
  const Heading = headingLevel;
  return (
    <section
      aria-labelledby={titleId}
      className={cn("relative isolate overflow-hidden border-b border-steel-700 bg-navy-950 text-steel-100", className)}
      {...props}
    >
      {grid ? <div aria-hidden="true" className="stack-grid pointer-events-none absolute inset-0 -z-10" /> : null}
      <div className="mx-auto flex max-w-4xl flex-col items-center px-5 py-20 text-center sm:py-28">
        <Heading id={titleId} className="max-w-3xl text-balance text-4xl font-semibold leading-snug tracking-tight text-white sm:text-5xl">
          {heading}
        </Heading>
        {description ? <div className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-steel-300">{description}</div> : null}
        {actions ? <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">{actions}</div> : null}
        {note ? <p className="mt-6 text-sm text-steel-300">{note}</p> : null}
      </div>
    </section>
  );
}