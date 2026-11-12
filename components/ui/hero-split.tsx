import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface HeroSplitEyebrow {
  text: string;
  href?: string;
}

export interface HeroSplitStat {
  value: string;
  label: string;
}

export interface HeroSplitProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  heading: string;
  accent?: string;
  headingLevel?: "h1" | "h2";
  eyebrow?: HeroSplitEyebrow;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  stats?: HeroSplitStat[];
  visual?: React.ReactNode;
}

const focusClasses =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";

export function HeroSplit({
  heading,
  accent,
  headingLevel = "h1",
  eyebrow,
  description,
  actions,
  stats,
  visual,
  className,
  ...props
}: HeroSplitProps) {
  const titleId = React.useId();
  const Heading = headingLevel;

  const pill = eyebrow ? (
    <Badge variant="gold" className="gap-2 py-1">
      {eyebrow.text}
      {eyebrow.href ? <Icons.arrowRight className="size-3.5" /> : null}
    </Badge>
  ) : null;

  return (
    <section
      aria-labelledby={titleId}
      className={cn("relative isolate overflow-hidden border-b border-steel-700 bg-navy-950 text-steel-100", className)}
      {...props}
    >
      <div
        className={cn(
          "mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:py-20 lg:gap-16 lg:py-24",
          visual ? "lg:grid-cols-2" : "lg:grid-cols-1",
        )}
      >
        <div className="flex max-w-xl flex-col items-start">
          {eyebrow ? (
            eyebrow.href ? (
              <Link href={eyebrow.href} className={cn("mb-8 rounded-control", focusClasses)}>
                {pill}
              </Link>
            ) : (
              <div className="mb-8">{pill}</div>
            )
          ) : null}

          <Heading id={titleId} className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            {heading}
            {accent ? <> <span className="text-gold-300">{accent}</span></> : null}
          </Heading>

          {description ? <div className="mt-6 text-pretty text-lg leading-relaxed text-steel-300">{description}</div> : null}

          {actions ? <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div> : null}

          {stats && stats.length > 0 ? (
            <dl className="mt-12 flex w-full flex-wrap gap-x-10 gap-y-6 border-t border-steel-700 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-1">
                  <dt className="text-sm text-steel-300">{stat.label}</dt>
                  <dd className="text-3xl font-semibold tracking-tight text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {visual ? <div className="flex justify-center">{visual}</div> : null}
      </div>
    </section>
  );
}