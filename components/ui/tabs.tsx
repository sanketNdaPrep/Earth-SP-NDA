"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return <TabsPrimitive.List ref={ref} className={cn("flex items-center border-b border-steel-700", className)} {...props} />;
});

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "-mb-px flex-1 border-b-2 border-transparent pb-3 text-center font-mono text-xs font-semibold uppercase tracking-wider text-steel-500",
        "transition-colors duration-(--duration-base) ease-(--ease-standard) hover:text-steel-100",
        "focus-visible:outline-none focus-visible:text-steel-100 focus-visible:ring-2 focus-visible:ring-gold-300/60",
        "data-[state=active]:border-gold-400 data-[state=active]:text-white",
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40", className)}
      {...props}
    />
  );
});