"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

/** Sample buttons for the preview. Real call sites use the same `toast.add` calls. */
export function ToastTypes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        onClick={() => toast.add({ description: "Draft saved on this device." })}
      >
        Default
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            type: "success",
            title: "Mock test submitted",
            description: "Your score is ready in Results.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({ type: "info", title: "Test starts in 10 minutes", description: "Find a quiet seat and keep paper ready." })
        }
      >
        Info
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({ type: "warning", title: "Timer is below 5 minutes", description: "Review your unanswered questions." })
        }
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            type: "error",
            title: "Could not save your answer",
            description: "Check your connection and try again.",
            priority: "high",
          })
        }
      >
        Error
      </Button>
    </div>
  );
}

/** Extra buttons that exercise sticky toasts, the three-toast limit and clearing. */
export function ToastExtras() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        onClick={() =>
          toast.add({ title: "Stays until dismissed", description: "This one has no timer.", duration: 0 })
        }
      >
        Sticky
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          for (let i = 1; i <= 4; i++) toast.add({ type: "info", description: `Notification ${i} of 4` });
        }}
      >
        Show four
      </Button>
      <Button variant="ghost" onClick={() => toast.clear()}>
        Clear all
      </Button>
    </div>
  );
}

export default ToastTypes;