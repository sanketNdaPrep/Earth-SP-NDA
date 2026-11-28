"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { PdfViewer } from "@/components/ui/pdf-viewer";
import { RESOURCE_BUCKET } from "@/lib/resources";
import { syllabusDownloadName } from "@/lib/pdf-upload";
import { supabase } from "@/lib/supabaseClient";

/** "View syllabus" and "Download syllabus" buttons on an exam page. They show only when an admin has uploaded one. `?view=syllabus` opens the viewer straight away. */
export function SyllabusDownload({ examSlug, examName }: { examSlug: string; examName: string }) {
  const [path, setPath] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  // null means "follow the address": /exams/nda?view=syllabus opens the viewer once the file is known.
  const [opened, setOpened] = React.useState<boolean | null>(null);
  const openAtStart = useSearchParams().get("view") === "syllabus";
  const viewing = opened ?? (openAtStart && Boolean(path));

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
      <Button variant="primary" size="sm" onClick={() => setOpened(true)}>
        <Icons.eye className="size-4" aria-hidden />
        View syllabus
      </Button>
      <Button variant="outline" size="sm" onClick={() => void save()} disabled={busy}>
        <Icons.download className="size-4" aria-hidden />
        {busy ? "Saving" : "Download syllabus"}
      </Button>
      {failed ? (
        <span role="alert" className="text-xs font-semibold text-danger-400">
          The download did not work. <a className="underline" href={url} target="_blank" rel="noreferrer">Open it in a new tab</a>.
        </span>
      ) : null}
      {viewing ? <PdfViewer url={url} title={`${examName} syllabus`} onClose={() => setOpened(false)} /> : null}
    </div>
  );
}
