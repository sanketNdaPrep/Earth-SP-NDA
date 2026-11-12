"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AuthForm, type AuthFormValues } from "@/components/ui/auth-form";

type Message = { type: "success" | "error"; text: string } | null;

/**
 * Preview wrapper for AuthForm. No Supabase here: submitting only shows a fake
 * loading state, then a message, so every visual state can be checked by eye.
 */
export function AuthFormDemo() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<Message>(null);
  const [last, setLast] = React.useState<AuthFormValues | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleSubmit = (values: AuthFormValues) => {
    setLast(values);
    setMessage(null);
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setMessage({
        type: "success",
        text: values.mode === "signup" ? "Account created (demo). Check your email." : "Signed in (demo).",
      });
    }, 1200);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <AuthForm onSubmit={handleSubmit} loading={loading} message={message} />

      <section aria-label="Preview controls" className="flex flex-col gap-3">
        <p className="text-steel-500 text-xs">Preview states (no real sign-in happens here):</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setMessage({ type: "error", text: "Invalid email or password." })}>
            Show error
          </Button>
          <Button type="button" variant="secondary" onClick={() => setMessage({ type: "success", text: "Check your email to confirm." })}>
            Show success
          </Button>
          <Button type="button" variant="secondary" onClick={() => setMessage(null)}>
            Clear message
          </Button>
        </div>
        {last ? (
          <p role="status" className="text-steel-300 text-xs">
            Last submit: {last.mode}, {last.email}
            {last.targetExam ? `, ${last.targetExam}` : ""}
          </p>
        ) : null}
      </section>
    </div>
  );
}