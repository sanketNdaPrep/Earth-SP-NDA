"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  type AlertDialogTone,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface AlertDialogDemoProps {
  triggerLabel: string;
  title: string;
  description: string;
  actionLabel: string;
  /** Omit for an information-only dialog with a single button. */
  cancelLabel?: string;
  tone?: AlertDialogTone;
  /** Called when the action button is pressed. */
  onConfirm?: () => void;
  /** Called when the dialog is cancelled (button or Escape). */
  onCancel?: () => void;
}

/** Prop-driven example: a trigger button, the dialog, and a live line showing the last choice. */
export function AlertDialogDemo({
  triggerLabel,
  title,
  description,
  actionLabel,
  cancelLabel,
  tone = "neutral",
  onConfirm,
  onCancel,
}: AlertDialogDemoProps) {
  const [choice, setChoice] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-3">
      <AlertDialog
        onOpenChange={(open) => {
          // Escape and Cancel both close with the action not taken.
          if (!open) onCancel?.();
        }}
      >
        <AlertDialogTrigger asChild>
          <Button variant="secondary">{triggerLabel}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent tone={tone}>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {cancelLabel ? (
              <AlertDialogCancel onClick={() => setChoice("Cancelled")}>{cancelLabel}</AlertDialogCancel>
            ) : null}
            <AlertDialogAction
              onClick={() => {
                setChoice("Confirmed");
                onConfirm?.();
              }}
            >
              {actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="min-h-5 font-mono text-xs uppercase tracking-wider text-steel-300">
        {choice ? `Last choice: ${choice}` : ""}
      </p>
    </div>
  );
}

export default AlertDialogDemo;