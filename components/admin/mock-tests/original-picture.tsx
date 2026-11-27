"use client";

import * as React from "react";
import { openPdf, type OpenPdf } from "@/lib/pdf-render";
import type { PageSpan } from "@/lib/pdf-questions";

/** One opened PDF per file, shared by every question that shows its picture. */
const opened = new WeakMap<File, Promise<OpenPdf>>();

function open(file: File): Promise<OpenPdf> {
  let promise = opened.get(file);
  if (!promise) {
    promise = openPdf(file);
    opened.set(file, promise);
    promise.catch(() => opened.delete(file));
  }
  return promise;
}

/** The original of a question as printed in the PDF, so the admin can compare the maths with it. */
export function OriginalPicture({ file, spans }: { file: File; spans: PageSpan[] }) {
  const [made, setMade] = React.useState<{ key: string; urls: string[]; error: string | null } | null>(null);
  const key = spans.map((s) => `${s.page}:${s.top}:${s.bottom}`).join("|");

  React.useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    (async () => {
      try {
        const pdf = await open(file);
        for (const span of spans) {
          const blob = await pdf.renderStrip(span.page, span.top, span.bottom);
          if (cancelled) return;
          urls.push(URL.createObjectURL(blob));
        }
        if (!cancelled) setMade({ key, urls: [...urls], error: null });
      } catch (e) {
        if (!cancelled) setMade({ key, urls: [], error: e instanceof Error ? e.message : "The picture could not be made." });
      }
    })();
    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
    // spans is summarised by key so a new array with the same strips does not redraw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, key]);

  const current = made && made.key === key ? made : null;
  if (current?.error) return <p role="alert" className="text-xs text-danger-400">{current.error}</p>;
  const urls = current?.urls;
  if (!urls) return <p className="text-xs text-steel-300" role="status">Loading the original...</p>;
  return (
    <div className="space-y-1 rounded-control bg-white p-2">
      {urls.map((u, i) => (
        // A picture made in the browser, so next/image has nothing to optimise.
        // eslint-disable-next-line @next/next/no-img-element
        <img key={u} src={u} alt={`The question as printed in the PDF, part ${i + 1} of ${urls.length}`} className="h-auto w-full" />
      ))}
    </div>
  );
}
