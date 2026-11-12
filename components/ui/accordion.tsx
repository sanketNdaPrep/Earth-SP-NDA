"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("border-b border-steel-700 last:border-b-0", className)}
      {...props}
    />
  );
});

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "group flex min-h-14 flex-1 items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-white",
          "transition-colors duration-(--duration-base) ease-(--ease-standard) hover:bg-navy-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-300",
          "disabled:cursor-not-allowed disabled:text-steel-500 disabled:hover:bg-transparent",
          className,
        )}
        {...props}
      >
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">{children}</span>
        <Icons.chevronDown
          className="size-5 shrink-0 text-steel-300 transition-transform duration-(--duration-base) ease-(--ease-standard) group-data-[state=open]:rotate-180 group-disabled:text-steel-700"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content ref={ref} className="accordion-content overflow-hidden" {...props}>
      <div className={cn("px-5 pb-5 text-sm leading-relaxed text-steel-300", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };