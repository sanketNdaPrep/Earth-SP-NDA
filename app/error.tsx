"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Runtime exception caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-4 text-center text-steel-100">
      <div className="mb-4 inline-flex rounded-full border border-danger-500/30 bg-danger-500/10 p-4 text-danger-400">
        <Icons.xCircle className="size-10" />
      </div>
      <h1 className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">
        SYSTEM EXECUTION INTERRUPTED
      </h1>
      <p className="mt-3 max-w-md text-sm text-steel-300">
        An unhandled exception occurred during application execution.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Button variant="primary" onClick={() => reset()}>
          Try Execution Again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Return to Command Portal
        </Button>
      </div>
    </div>
  );
}