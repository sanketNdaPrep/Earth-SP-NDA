"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  icon?: React.ReactNode;
  [key: string]: any;
}

const toastFn = (props: any) => {
  if (typeof window !== "undefined") {
    console.log("[Toast Notification]:", props);
  }
};

toastFn.add = (props: any) => toastFn(props);
toastFn.clear = () => {};
toastFn.dismiss = (id?: string) => {};

export const toast = toastFn;

const ToastContext = React.createContext<{
  toast: typeof toastFn;
  add: (props: any) => void;
  clear: () => void;
  dismiss: (id?: string) => void;
}>({
  toast: toastFn,
  add: (props: any) => {},
  clear: () => {},
  dismiss: (id?: string) => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const triggerToast = React.useCallback((props: ToastProps) => {
    const id = props.id || Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = React.useCallback((id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toast: toastFn,
        add: triggerToast,
        clear: () => setToasts([]),
        dismiss,
      }}
    >
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-panel border p-4 shadow-lg backdrop-blur-md transition-all duration-300",
              t.variant === "destructive"
                ? "border-danger-500/50 bg-danger-500/10 text-danger-300"
                : t.variant === "success"
                ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                : "border-steel-700 bg-navy-900/95 text-steel-100"
            )}
          >
            {t.icon && <div className="mt-0.5 shrink-0">{t.icon}</div>}
            <div className="flex-1 space-y-1">
              {t.title && <div className="text-sm font-semibold text-white">{t.title}</div>}
              {t.description && <div className="text-xs text-steel-300">{t.description}</div>}
            </div>
            {t.action}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}

export function Toaster() {
  return null;
}