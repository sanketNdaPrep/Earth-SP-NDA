import * as React from "react";
import { cn } from "@/lib/utils";

export type StackedSectionTone = "dark" | "raised" | "light";
export type StackedSectionHeadingLevel = "h2" | "h3" | "h4";

const toneClasses: Record<StackedSectionTone, string> = {
  dark: "bg-navy-950 text-steel-100",
  raised: "bg-navy-900 text-steel-100",
  light: "bg-steel-100 text-navy-950",
};

export interface StackedSectionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Wrapper for a run of `StackedSection`s. Each section sticks to the top of the
 * screen, so the next one slides up and covers it. Pure CSS: no scroll library,
 * no client JavaScript. Native scrolling is untouched.
 */
export function StackedSections({ className, children, ...props }: StackedSectionsProps) {
  return (
    <div className={cn("relative w-full", className)} {...props}>
      {children}
    </div>
  );
}

export interface StackedSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Main line of the section. */
  heading: React.ReactNode;
  /** Heading level. The page itself should own the single h1. */
  headingLevel?: StackedSectionHeadingLevel;
  tone?: StackedSectionTone;
  /** Round the top corners and add a top edge, so the overlap reads clearly. */
  roundedTop?: boolean;
  /** Optional supporting content under the heading. */
  children?: React.ReactNode;
}

/**
 * One card in the stack. Sticky only when the visitor has not asked for reduced
 * motion; otherwise the sections simply stack down the page in order.
 * Keep content short: a section taller than the screen cannot show its bottom
 * edge before the next one covers it.
 */
export function StackedSection({
  heading,
  headingLevel = "h2",
  tone = "dark",
  roundedTop = false,
  className,
  children,
  ...props
}: StackedSectionProps) {
  const Heading = headingLevel;
  return (
    <section
      className={cn(
        "relative grid min-h-dvh w-full place-content-center overflow-hidden px-8 py-16 text-center motion-safe:sticky motion-safe:top-0",
        toneClasses[tone],
        roundedTop && "rounded-t-panel border-t border-steel-700",
        className,
      )}
      {...props}
    >
      <div aria-hidden="true" className="stack-grid pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-4">
        <Heading className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl 2xl:text-7xl">
          {heading}
        </Heading>
        {children}
      </div>
    </section>
  );
}