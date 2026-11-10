"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export interface TimelineProps {
  data: TimelineEntry[];
  heading?: string;
  description?: string;
  className?: string;
}

/**
 * Vertical timeline with sticky titles (md and up) and a gold beam that grows down
 * the rail as you scroll. The beam is a scaled element (no height measuring); with
 * reduced motion it is shown full length. The rail and markers are decorative.
 */
export function Timeline({ data, heading, description, className }: TimelineProps) {
  const headingId = React.useId();
  const reduceMotion = useReducedMotion();
  const listRef = React.useRef<HTMLDivElement>(null);

  // The beam completes when the end of the list reaches the bottom of the viewport.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 10%", "end end"] });
  // With reduced motion the ranges collapse to 1, so the beam is simply shown full length.
  const scaleY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.05], reduceMotion ? [1, 1] : [0, 1]);

  return (
    <div className={cn("w-full text-steel-100", className)}>
      {heading ? (
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
          <h2 id={headingId} className="max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {heading}
          </h2>
          {description ? <p className="mt-3 max-w-xl text-steel-300">{description}</p> : null}
        </div>
      ) : null}

      <div ref={listRef} className="relative mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <div aria-hidden="true" className="timeline-rail absolute top-0 left-8 h-full w-0.5 -translate-x-1/2 md:left-12">
          <motion.div style={{ scaleY, opacity }} className="absolute inset-0 origin-top rounded-control bg-linear-to-t from-gold-400 via-gold-300 to-transparent" />
        </div>

        <ol aria-labelledby={heading ? headingId : undefined} className="list-none">
          {data.map((entry) => (
            <li key={entry.title} className="relative flex justify-start pt-10 md:gap-10 md:pt-24">
              <div className="z-10 flex md:sticky md:top-24 max-w-xs items-center self-start md:w-full lg:max-w-sm">
                <span aria-hidden="true" className="absolute left-0 grid size-8 place-items-center rounded-full border border-steel-700 bg-navy-950">
                  <span className="size-2.5 rounded-full bg-gold-400" />
                </span>
                <h3 className="hidden pl-14 text-4xl font-bold text-steel-500 md:block">{entry.title}</h3>
              </div>

              <div className="relative w-full pr-4 pl-12 md:pl-4">
                <h3 className="mb-4 text-2xl font-bold text-white md:hidden">{entry.title}</h3>
                {entry.content}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default Timeline;