"use client";

import * as React from "react";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type PasswordFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/** A password box with a Show / Hide button, so a student can check what they typed on a small keyboard. */
export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField({ className, ...props }, ref) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(
          "w-full rounded-control border border-steel-700 bg-navy-950 py-2 pl-3 pr-11 text-sm text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-steel-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-400"
      >
        {visible ? <Icons.eyeOff className="size-4" /> : <Icons.eye className="size-4" />}
      </button>
    </div>
  );
});
