"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { RESOURCE_BUCKET } from "@/lib/resources";
import { syllabusDownloadName } from "@/lib/pdf-upload";
import { supabase } from "@/lib/supabaseClient";

/** A "Download syllabus" button on an exam page. It shows only when an admin has uploaded one. */
export function SyllabusDownload({ examSlug, examName }: { examSlug: string; examName: string }) {
  const [path, setPath] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("subjects")
      .select("syllabus_path")
      .eq("kind", "exam")
      .eq("slug", examSlug)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setPath((data as { syllabus_path: string | null } | null)?.syllabus_path ?? null);
      });
    return () => {
      active = false;
    };
  }, [examSlug]);

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
      a.download = syllabusDownloadName(examName);
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
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Button variant="primary" size="sm" onClick={() => void save()} disabled={busy}>
        <Icons.download className="size-4" aria-hidden />
        {busy ? "Saving" : "Download syllabus"}
      </Button>
      {failed ? (
        <span role="alert" className="text-xs font-semibold text-danger-400">
          The download did not work. <a className="underline" href={url} target="_blank" rel="noreferrer">Open it in a new tab</a>.
        </span>
      ) : null}
    </div>
  );
}
