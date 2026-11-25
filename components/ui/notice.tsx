"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

export type NoticeKind = "success" | "error" | "warning" | "info";

const look: Record<NoticeKind, { title: string; box: string; icon: string; title_: string; bar: string; Icon: (p: { className?: string }) => React.ReactNode }> = {
  success: {
    title: "Saved",
    box: "border-emerald-400/40 bg-linear-to-r from-emerald-400/15 to-emerald-400/5 shadow-notice",
    icon: "bg-emerald-400/20 text-emerald-300 ring-4 ring-emerald-400/10",
    title_: "text-emerald-300",
    bar: "bg-emerald-400",
    Icon: Icons.check,
  },
  error: {
    title: "Not saved",
    box: "border-danger-500/45 bg-linear-to-r from-danger-500/15 to-danger-500/5",
    icon: "bg-danger-500/20 text-danger-400 ring-4 ring-danger-500/10",
    title_: "text-danger-400",
    bar: "bg-danger-500",
    Icon: Icons.warning,
  },
  warning: {
    title: "Check this",
    box: "border-gold-400/40 bg-linear-to-r from-gold-400/15 to-gold-400/5",
    icon: "bg-gold-400/20 text-gold-300 ring-4 ring-gold-400/10",
    title_: "text-gold-300",
    bar: "bg-gold-400",
    Icon: Icons.warning,
  },
  info: {
    title: "Note",
    box: "border-sky-300/35 bg-linear-to-r from-sky-300/15 to-sky-300/5",
    icon: "bg-sky-300/20 text-sky-300 ring-4 ring-sky-300/10",
    title_: "text-sky-300",
    bar: "bg-sky-300",
    Icon: Icons.info,
  },
};

export interface NoticeProps {
  kind: NoticeKind;
  /** The message. Plain text or inline elements. */
  children: React.ReactNode;
  /** Bold headline above the message. Defaults to "Saved", "Not saved", "Check this" or "Note". */
  title?: string;
  /** Buttons or links on the right (below on a phone). */
  actions?: React.ReactNode;
  /** Shows a close button, and is called when it is pressed or the timer ends. */
  onClose?: () => void;
  /** Hides itself after this many milliseconds, with a line that drains. Leave out to stay until closed. */
  autoHideMs?: number;
  /** If the notice appears outside the visible screen, scrolls just enough to show it. Never moves the page when it is already visible. Default true. */
  reveal?: boolean;
  className?: string;
}

/** The saved / error / warning / info message used across the admin. Follows the dark and light themes. */
export function Notice({ kind, children, title, actions, onClose, autoHideMs, reveal = true, className }: NoticeProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef(onClose);
  React.useEffect(() => {
    closeRef.current = onClose;
  });
  const v = look[kind];

  // Only moves the page when the message is outside the visible screen, and then by the smallest amount.
  // A message that is already in view never makes the page jump.
  React.useEffect(() => {
    const el = ref.current;
    if (!reveal || !el) return;
    const { top, bottom } = el.getBoundingClientRect();
    if (top >= 0 && bottom <= window.innerHeight) return;
    el.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [reveal]);

  React.useEffect(() => {
    if (!autoHideMs || !closeRef.current) return;
    const timer = setTimeout(() => closeRef.current?.(), autoHideMs);
    return () => clearTimeout(timer);
  }, [autoHideMs]);

  return (
    <div
      ref={ref}
      role={kind === "error" ? "alert" : "status"}
      className={cn("notice-in relative flex flex-wrap items-start gap-x-3.5 gap-y-3 overflow-hidden rounded-panel border py-3.5 pr-11 pl-4 sm:flex-nowrap sm:items-center", v.box, className)}
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", v.icon)} aria-hidden>
        <v.Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className={cn("font-display text-base leading-tight font-bold tracking-wide", v.title_)}>{title ?? v.title}</p>
        <p className="text-sm text-steel-300 [&_b]:font-semibold [&_b]:text-white">{children}</p>
      </div>
      {actions ? <div className="flex w-full flex-wrap items-center gap-2 pl-11.5 sm:w-auto sm:pl-0">{actions}</div> : null}
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close message"
          className="absolute top-2.5 right-2.5 grid size-7 place-items-center rounded-control text-steel-500 transition-colors hover:bg-steel-100/10 hover:text-white focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:outline-none"
        >
          <Icons.close className="size-3.5" />
        </button>
      ) : null}
      {autoHideMs && onClose ? <span aria-hidden className={cn("notice-bar absolute inset-x-0 bottom-0 h-0.75", v.bar)} style={{ "--notice-ms": `${autoHideMs}ms` } as React.CSSProperties} /> : null}
    </div>
  );
}
