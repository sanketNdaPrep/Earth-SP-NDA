"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

const BASE_SIZE = 40;
const MAX_SIZE = 64;
const REACH = 140;
const SPRING = { mass: 0.1, stiffness: 170, damping: 14 };

interface DockContextValue {
  pointerX: MotionValue<number>;
  magnify: boolean;
}

const DockContext = React.createContext<DockContextValue | null>(null);

function useDock(): DockContextValue {
  const ctx = React.useContext(DockContext);
  if (!ctx) throw new Error("DockItem must be used inside Dock");
  return ctx;
}

export interface DockProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  label: string;
  children: React.ReactNode;
}

export function Dock({ label, className, children, ...props }: DockProps) {
  const pointerX = useMotionValue(Number.POSITIVE_INFINITY);
  const reduceMotion = useReducedMotion();
  const magnify = !reduceMotion;

  return (
    <DockContext.Provider value={{ pointerX, magnify }}>
      <nav aria-label={label} className={cn("w-fit max-w-full", className)} {...props}>
        <ul
          onPointerMove={(e) => {
            if (magnify && e.pointerType === "mouse") pointerX.set(e.clientX);
          }}
          onPointerLeave={() => pointerX.set(Number.POSITIVE_INFINITY)}
          className="flex h-16 items-end gap-2 rounded-panel border border-steel-700 bg-navy-900 px-2 pb-2 shadow-panel"
        >
          {children}
        </ul>
      </nav>
    </DockContext.Provider>
  );
}

type DockItemTarget =
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void };

export type DockItemProps = DockItemTarget & {
  label: string;
  current?: boolean;
  children: React.ReactNode;
  className?: string;
};

const itemClasses =
  "group relative flex size-full items-center justify-center rounded-control border border-steel-700 bg-navy-800 text-steel-300 " +
  "transition-colors duration-fast ease-standard hover:bg-navy-900 hover:text-steel-100 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";

export function DockItem({ label, href, onClick, current = false, children, className }: DockItemProps) {
  const { pointerX, magnify } = useDock();
  const ref = React.useRef<HTMLLIElement>(null);
  const focusBoost = useMotionValue(0);

  const distance = useTransform(pointerX, (x) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return Number.POSITIVE_INFINITY;
    return x - rect.x - rect.width / 2;
  });
  const hoverSize = useTransform(distance, [-REACH, 0, REACH], [BASE_SIZE, MAX_SIZE, BASE_SIZE]);
  const target = useTransform([hoverSize, focusBoost], ([hover, focus]: number[]) => (focus ? MAX_SIZE : hover));
  const size = useSpring(target, SPRING);
  const iconScale = useTransform(size, [BASE_SIZE, MAX_SIZE], [1, 1.35]);

  const handlers = {
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      if (magnify && e.currentTarget.matches(":focus-visible")) focusBoost.set(1);
    },
    onBlur: () => focusBoost.set(0),
  };

  const content = (
    <>
      <motion.span style={{ scale: iconScale }} className="flex items-center justify-center" aria-hidden="true">
        {children}
      </motion.span>
      {current ? (
        <span aria-hidden="true" className="absolute -bottom-1.5 size-1 rounded-full bg-gold-300" />
      ) : null}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-control border border-steel-700 bg-navy-900 px-2 py-1 text-xs font-medium text-steel-100 opacity-0 transition-opacity duration-fast ease-standard group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {label}
      </span>
    </>
  );

  return (
    <motion.li ref={ref} style={{ width: size, height: size }} className={cn("shrink-0", className)}>
      {href !== undefined ? (
        <Link href={href} aria-label={label} aria-current={current ? "page" : undefined} className={itemClasses} {...handlers}>
          {content}
        </Link>
      ) : (
        <button type="button" aria-label={label} aria-current={current ? "page" : undefined} onClick={onClick} className={itemClasses} {...handlers}>
          {content}
        </button>
      )}
    </motion.li>
  );
}