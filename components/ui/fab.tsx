"use client";

import * as React from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type FabDirection = "up-left" | "up" | "up-right";

const RADIUS = 104;
const ARC: Record<FabDirection, [number, number]> = {
  "up-left": [180, 90],
  up: [150, 30],
  "up-right": [90, 0],
};

const topTooltip: Partial<Record<FabDirection, string>> = {
  "up-left": "bottom-full mb-2 right-0",
  "up-right": "bottom-full mb-2 left-0",
};

const tooltipSide: Record<FabDirection, string> = {
  "up-left": "right-full mr-2",
  "up-right": "left-full ml-2",
  up: "bottom-full mb-2 left-1/2 -translate-x-1/2",
};

type FabActionTarget =
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void };

export type FabAction = FabActionTarget & {
  label: string;
  icon: React.ReactNode;
};

export interface FabProps {
  label: string;
  actions: FabAction[];
  direction?: FabDirection;
  className?: string;
}

function offsets(count: number, direction: FabDirection): { x: number; y: number }[] {
  const [start, end] = ARC[direction];
  return Array.from({ length: count }, (_, i) => {
    const angle = count === 1 ? (start + end) / 2 : start + ((end - start) * i) / (count - 1);
    const rad = (angle * Math.PI) / 180;
    return { x: Math.round(RADIUS * Math.cos(rad)), y: Math.round(-RADIUS * Math.sin(rad)) };
  });
}

const buttonBase =
  "flex size-full items-center justify-center rounded-full " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";

export function Fab({ label, actions, direction = "up-left", className }: FabProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listId = React.useId();
  const list = actions.slice(0, 4);
  const points = offsets(list.length, direction);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative size-14", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close(true);
        }
      }}
      onBlur={(e) => {
        if (open && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          buttonBase,
          "relative z-10 bg-gold-400 text-navy-950 shadow-panel transition-colors duration-fast ease-standard hover:bg-gold-300",
        )}
      >
        <Icons.plus
          className={cn("size-6 transition-transform duration-base ease-standard motion-reduce:transition-none", open && "rotate-45")}
        />
      </button>
      <ul id={listId} inert={!open} className="absolute inset-0">
        {list.map((action, i) => {
          const { x, y } = points[i];
          const isTop = direction === "up-left" ? i === list.length - 1 : direction === "up-right" && i === 0;
          const inner = (
            <>
              <span aria-hidden="true" className="flex items-center justify-center">
                {action.icon}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute whitespace-nowrap rounded-control border border-steel-700 bg-navy-900 px-2 py-1 text-xs font-medium text-steel-100 opacity-0 transition-opacity duration-fast ease-standard group-hover:opacity-100 group-focus-visible:opacity-100",
                  isTop && topTooltip[direction] ? topTooltip[direction] : tooltipSide[direction],
                )}
              >
                {action.label}
              </span>
            </>
          );
          const itemClasses = cn(
            buttonBase,
            "group relative border border-steel-700 bg-navy-800 text-steel-100 transition-colors duration-fast ease-standard hover:bg-navy-900",
          );
          return (
            <li
              key={action.label}
              className="absolute -ml-6 -mt-6 size-12 transition duration-base ease-throw motion-reduce:transition-none"
              style={{
                left: "50%",
                top: "50%",
                opacity: open ? 1 : 0,
                transform: open ? `translate(${x}px, ${y}px) scale(1)` : "translate(0px, 0px) scale(0.5)",
                transitionDelay: open ? `${i * 30}ms` : "0ms",
              }}
            >
              {action.href !== undefined ? (
                <Link href={action.href} aria-label={action.label} className={itemClasses} onClick={() => close(false)}>
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-label={action.label}
                  className={itemClasses}
                  onClick={() => {
                    action.onClick();
                    close(true);
                  }}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}