"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { subjectSyllabusName, syllabusUrl } from "@/lib/syllabus-files";

/** Downloads one subject's syllabus PDF for one exam. Shows nothing until an admin has uploaded it. */
export function SubjectSyllabusButton({ exam, subject, path, label }: { exam: string; subject: string; path: string | undefined; label?: string }) {
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  if (!path) return null;
  const url = syllabusUrl(path);

  const save = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const href = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = href;
      a.download = subjectSyllabusName(exam, subject);
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
      <Button variant="outline" size="sm" onClick={() => void save()} disabled={busy} aria-label={`Download ${subject} syllabus for ${exam}`}>
        <Icons.download className="size-4" aria-hidden />
        {busy ? "Saving" : (label ?? "Download syllabus")}
      </Button>
      {failed ? (
        <span role="alert" className="text-xs font-semibold text-danger-400">
          Did not work. <a className="underline" href={url} target="_blank" rel="noreferrer">Open in a new tab</a>.
        </span>
      ) : null}
    </span>
  );
}
