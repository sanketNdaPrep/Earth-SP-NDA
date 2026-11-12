"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface AccordionListItem {
  value: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  /** Shown as visible text beside the title of a disabled item, e.g. "Coming soon". */
  disabledNote?: string;
}

export interface AccordionListProps {
  items: AccordionListItem[];
  /** "single" opens one item at a time (and can collapse it); "multiple" allows several. */
  type?: "single" | "multiple";
  /** Values of items that start open. */
  defaultOpen?: string[];
  className?: string;
}

/** Prop-driven accordion: you supply the items, nothing is built in. */
export function AccordionList({ items, type = "single", defaultOpen = [], className }: AccordionListProps) {
  const children = items.map((item) => (
    <AccordionItem key={item.value} value={item.value} disabled={item.disabled}>
      <AccordionTrigger>
        <span>{item.title}</span>
        {item.disabled && item.disabledNote ? (
          <span className="font-mono text-xs font-normal uppercase tracking-wider text-steel-500">
            {item.disabledNote}
          </span>
        ) : null}
      </AccordionTrigger>
      <AccordionContent>{item.content}</AccordionContent>
    </AccordionItem>
  ));
  const frame = cn("w-full overflow-hidden rounded-panel border border-steel-700 bg-navy-900 shadow-panel", className);

  return type === "multiple" ? (
    <Accordion type="multiple" defaultValue={defaultOpen} className={frame}>
      {children}
    </Accordion>
  ) : (
    <Accordion type="single" collapsible defaultValue={defaultOpen[0]} className={frame}>
      {children}
    </Accordion>
  );
}

export default AccordionList;