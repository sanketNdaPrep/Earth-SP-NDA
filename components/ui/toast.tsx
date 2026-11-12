"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

export type ToastType = "default" | "success" | "info" | "warning" | "error";
export type ToastPriority = "low" | "high";

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  description?: string;
  /** "high" interrupts screen readers (assertive). Default is polite. */
  priority?: ToastPriority;
  /** Milliseconds before it closes. Default 5000 (8000 for errors). 0 keeps it until dismissed. */
  duration?: number;
}

interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  description?: string;
  priority: ToastPriority;
  duration: number;
  open: boolean;
}

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 8000;
const REMOVE_DELAY = 300;

/* ---------- global store (callable from anywhere, no hook needed) ---------- */

let items: ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => items;
const getServerSnapshot = () => items;

function remove(id: string) {
  items = items.filter((t) => t.id !== id);
  emit();
}

function close(id: string) {
  if (!items.some((t) => t.id === id && t.open)) return;
  items = items.map((t) => (t.id === id ? { ...t, open: false } : t));
  emit();
  // Keep the node mounted just long enough for the exit animation.
  setTimeout(() => remove(id), REMOVE_DELAY);
}

export const toast = {
  /** Show a toast. Returns its id. */
  add(options: ToastOptions): string {
    const type = options.type ?? "default";
    const id = `toast-${++counter}`;
    const next: ToastItem = {
      id,
      type,
      title: options.title,
      description: options.description,
      priority: options.priority ?? "low",
      duration: options.duration ?? (type === "error" ? ERROR_DURATION : DEFAULT_DURATION),
      open: true,
    };
    items = [...items, next];
    // Cap: when a fourth arrives, the oldest open toast is dismissed.
    const openOnes = items.filter((t) => t.open);
    if (openOnes.length > MAX_VISIBLE) {
      const overflow = openOnes.slice(0, openOnes.length - MAX_VISIBLE);
      items = items.map((t) => (overflow.some((o) => o.id === t.id) ? { ...t, open: false } : t));
      overflow.forEach((o) => setTimeout(() => remove(o.id), REMOVE_DELAY));
    }
    emit();
    return id;
  },
  /** Close one toast by id. */
  dismiss(id: string) {
    close(id);
  },
  /** Close every toast. */
  clear() {
    items.filter((t) => t.open).forEach((t) => close(t.id));
  },
};

/* ---------- presentation ---------- */

const TYPE_STYLES: Record<
  ToastType,
  { word: string; accent: string; iconClass: string; Icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element }
> = {
  default: { word: "Notice", accent: "bg-steel-500", iconClass: "text-steel-300", Icon: Icons.logo },
  success: { word: "Success", accent: "bg-emerald-400", iconClass: "text-emerald-300", Icon: Icons.checkCircle },
  info: { word: "Information", accent: "bg-steel-300", iconClass: "text-steel-300", Icon: Icons.info },
  warning: { word: "Warning", accent: "bg-gold-400", iconClass: "text-gold-300", Icon: Icons.warning },
  error: { word: "Error", accent: "bg-danger-500", iconClass: "text-danger-400", Icon: Icons.xCircle },
};

/**
 * Mount once (the dev page mounts its own; the real layout is not wired yet).
 * Renders every toast added through `toast.add`.
 */
export function Toaster({ className }: { className?: string }) {
  const list = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={DEFAULT_DURATION} label="Notifications">
      {list.map((t) => {
        const { word, accent, iconClass, Icon } = TYPE_STYLES[t.type];
        return (
          <ToastPrimitive.Root
            key={t.id}
            open={t.open}
            onOpenChange={(open) => {
              if (!open) close(t.id);
            }}
            // "foreground" = assertive live region, "background" = polite
            type={t.priority === "high" ? "foreground" : "background"}
            // Radix pauses timers while focus is inside the viewport. If the focused toast
            // is removed, no blur event fires and later toasts would stay paused. Blur first.
            onEscapeKeyDown={() => (document.activeElement as HTMLElement | null)?.blur()}
            duration={t.duration === 0 ? Number.POSITIVE_INFINITY : t.duration}
            className="toast-root relative flex items-start gap-3 overflow-hidden rounded-panel border border-steel-700 bg-navy-900 py-4 pl-5 pr-3 shadow-panel"
          >
            <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", accent)} />
            <Icon className={cn("mt-0.5 size-5 shrink-0", iconClass)} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {t.title ? (
                <ToastPrimitive.Title className="text-sm font-semibold leading-snug text-white">
                  <span className="sr-only">{word}: </span>
                  {t.title}
                </ToastPrimitive.Title>
              ) : null}
              {t.description ? (
                <ToastPrimitive.Description className="text-sm leading-relaxed text-steel-300">
                  {!t.title ? <span className="sr-only">{word}: </span> : null}
                  {t.description}
                </ToastPrimitive.Description>
              ) : null}
            </div>
            <ToastPrimitive.Close
              aria-label="Dismiss notification"
              onClick={(event) => event.currentTarget.blur()}
              className="flex size-8 shrink-0 items-center justify-center rounded-control text-steel-300 transition-colors duration-(--duration-base) ease-(--ease-standard) hover:bg-navy-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
            >
              <Icons.close className="size-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport
        className={cn(
          "fixed inset-x-0 bottom-0 z-100 m-0 flex list-none flex-col gap-2 p-4 outline-none sm:inset-x-auto sm:right-0 sm:w-96",
          className,
        )}
      />
    </ToastPrimitive.Provider>
  );
}