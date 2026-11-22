"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { pdfDownloadName } from "@/lib/pdf-upload";
import { RESOURCE_BUCKET } from "@/lib/resources";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  testId: string;
  title: string;
  /** The saved PDF path when the page already has it. Otherwise it is looked up. */
  path?: string | null;
  size?: "sm" | "md";
  variant?: "primary" | "outline" | "ghost";
}

/** "Download PDF": the exact file the admin uploaded for this test. Shows nothing when the test has none. */
export function TestPdfDownload({ testId, title, path: given, size = "sm", variant = "outline" }: Props) {
  const [found, setFound] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const lookup = given === undefined;

  React.useEffect(() => {
    if (!lookup) return;
    let active = true;
    supabase
      .from("mock_tests")
      .select("source_pdf")
      .eq("id", testId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setFound((data as { source_pdf: string | null } | null)?.source_pdf ?? null);
      });
    return () => {
      active = false;
    };
  }, [lookup, testId]);

  const path = lookup ? found : given;
  if (!path) return null;
  const url = supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(path).data.publicUrl;

  const save = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const href = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = href;
      a.download = pdfDownloadName(title, "test");
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button type="button" variant={variant} size={size} onClick={() => void save()} disabled={busy}>
        <Icons.download className="size-4" aria-hidden />
        {busy ? "Saving" : "Download PDF"}
        <span className="sr-only">: {title}</span>
      </Button>
      {failed ? (
        <span role="alert" className="text-xs font-semibold text-danger-400">
          The download did not work. <a className="underline" href={url} target="_blank" rel="noreferrer">Open it in a new tab</a>.
        </span>
      ) : null}
    </span>
  );
}
