"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export interface LayoutTextFlipProps {
  text?: string;
  words: string[];
  interval?: number;
  paused?: boolean;
  showControl?: boolean;
  fixedWidth?: boolean;
  className?: string;
}

export function LayoutTextFlip({
  text,
  words,
  interval = 3000,
  paused = false,
  showControl = false,
  fixedWidth = false,
  className,
}: LayoutTextFlipProps) {
  const prefersReducedMotion = useReducedMotion();
  const mounted = React.useSyncExternalStore(subscribeNoop, () => true, () => false);
  const reduceMotion = mounted && Boolean(prefersReducedMotion);
  const list = words.filter((w) => w.trim().length > 0);
  const [index, setIndex] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);
  const tabHidden = React.useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "hidden",
    () => false,
  );

  const canRotate = list.length > 1 && !reduceMotion;
  const running = canRotate && !paused && !userPaused && !hovered && !focused && !tabHidden;

  React.useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % list.length), Math.max(500, interval));
    return () => window.clearTimeout(id);
  }, [running, index, interval, list.length]);

  if (list.length === 0) return null;

  const current = list[index % list.length];
  const sentence = [text?.trim(), list.join(", ")].filter(Boolean).join(" ");

  const word = reduceMotion ? (
    <span>{list[0]}</span>
  ) : (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={current}
        data-flip-word=""
        initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        transition={{ duration: 0.4 }}
        className={cn("inline-block text-center", fixedWidth && "absolute inset-0 flex items-center justify-center")}
      >
        {current}
      </motion.span>
    </AnimatePresence>
  );

  return (
    <span
      className={cn("inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <span className="sr-only">{sentence}</span>

      <span aria-hidden="true" className="contents">
        {text ? <span>{text}</span> : null}
        <motion.span
          layout={fixedWidth ? false : "size"}
          className="relative inline-flex max-w-full items-center justify-center overflow-hidden rounded-control border border-steel-700 bg-navy-800 px-3 py-1 text-gold-300 shadow-panel"
        >
          {fixedWidth ? (
            <span className="invisible inline-grid max-w-full">
              {list.map((w) => (
                <span key={w} className="col-start-1 row-start-1 text-center">
                  {w}
                </span>
              ))}
            </span>
          ) : null}
          {word}
        </motion.span>
      </span>

      {showControl && canRotate ? (
        <button
          type="button"
          onClick={() => setUserPaused((v) => !v)}
          aria-label={userPaused ? "Play word rotation" : "Pause word rotation"}
          className="inline-flex size-8 items-center justify-center rounded-control border border-steel-700 bg-navy-900 text-steel-300 transition-colors duration-(--duration-base) ease-(--ease-standard) hover:bg-navy-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
        >
          {userPaused ? <Icons.play className="size-4" /> : <Icons.pause className="size-4" />}
        </button>
      ) : null}
    </span>
  );
}

export default LayoutTextFlip;