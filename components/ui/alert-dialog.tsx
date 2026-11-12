"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export type AlertDialogTone = "neutral" | "danger";

const ToneContext = React.createContext<AlertDialogTone>("neutral");

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  tone?: AlertDialogTone;
}

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(function AlertDialogContent({ className, tone = "neutral", children, onOpenAutoFocus, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm" />
      <AlertDialogPrimitive.Content
        ref={ref}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (event.defaultPrevented) return;
          const root = event.target as HTMLElement | null;
          if (root && !root.querySelector("[data-dialog-cancel]")) {
            event.preventDefault();
            root.querySelector<HTMLElement>("[data-dialog-action]")?.focus({ preventScroll: true });
          }
        }}
        className={cn(
          "dialog-content fixed inset-x-4 inset-y-0 z-50 m-auto h-fit max-h-dvh max-w-md overflow-y-auto",
          "rounded-panel border border-steel-700 bg-navy-900 p-6 shadow-panel",
          tone === "danger" && "border-t-2 border-t-danger-500",
          className,
        )}
        {...props}
      >
        <ToneContext.Provider value={tone}>{children}</ToneContext.Provider>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
});

function AlertDialogHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const tone = React.useContext(ToneContext);
  return (
    <div className={cn("flex items-start gap-4", className)} {...props}>
      {tone === "danger" ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-danger-500/40 bg-danger-500/10 text-danger-400">
          <Icons.warning className="size-5" />
        </span>
      ) : null}
      <div className="flex min-w-0 flex-col gap-2">{children}</div>
    </div>
  );
}

function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(function AlertDialogTitle({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold leading-snug text-white", className)}
      {...props}
    />
  );
});

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn("text-sm leading-relaxed text-steel-300", className)}
      {...props}
    />
  );
});

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(function AlertDialogAction({ className, children, ...props }, ref) {
  const tone = React.useContext(ToneContext);
  return (
    <AlertDialogPrimitive.Action ref={ref} asChild {...props}>
      <Button variant={tone === "danger" ? "danger" : "primary"} className={className} data-dialog-action="">
        {children}
      </Button>
    </AlertDialogPrimitive.Action>
  );
});

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(function AlertDialogCancel({ className, children, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Cancel ref={ref} asChild {...props}>
      <Button variant="secondary" className={className} data-dialog-cancel="">
        {children}
      </Button>
    </AlertDialogPrimitive.Cancel>
  );
});

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};