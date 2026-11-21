"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { downloadPicture, downloadSourcePdf } from "@/components/flashcards/download";
import { pictureUrl } from "@/components/flashcards/picture-url";
import { pdfDownloadName } from "@/lib/pdf-upload";
import { stepIndex, type FlashcardImage } from "@/lib/flashcard-images";

interface PictureViewerProps {
  items: readonly FlashcardImage[];
  index: number;
  /** Heading for the open picture, for example "Maths > Trigonometry". */
  label: (item: FlashcardImage) => string;
  onIndex: (next: number) => void;
  onClose: () => void;
  /** File name for downloading the open picture. Leave out to hide the download button. */
  fileName?: (item: FlashcardImage, index: number) => string;
}

/** A full-screen look at one picture, with next and previous. Esc closes it, the arrow keys move. */
export function PictureViewer({ items, index, label, onIndex, onClose, fileName }: PictureViewerProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const item = items[index];
  const [saving, setSaving] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const [savingPdf, setSavingPdf] = React.useState(false);

  const savePdf = async () => {
    if (!item?.source_pdf) return;
    setSavingPdf(true);
    setFailed(false);
    try {
      await downloadSourcePdf(item, pdfDownloadName(item.source_name));
    } catch {
      setFailed(true);
    } finally {
      setSavingPdf(false);
    }
  };

  const save = async () => {
    if (!item || !fileName) return;
    setSaving(true);
    setFailed(false);
    try {
      await downloadPicture(item, fileName(item, index));
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(stepIndex(index, 1, items.length));
      if (e.key === "ArrowLeft") onIndex(stepIndex(index, -1, items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onIndex, onClose]);

  if (!item) return null;
  const many = items.length > 1;

  return (
    <div role="dialog" aria-modal="true" aria-label="Flashcard picture" className="fixed inset-0 z-50 flex flex-col bg-navy-950/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-700/60 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{label(item)}</p>
          {many ? <p className="font-mono text-xs text-steel-300">{index + 1} of {items.length}</p> : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {fileName ? (
            <Button variant="primary" size="sm" onClick={save} disabled={saving} aria-label={item.source_pdf ? "Download this page" : "Download this flashcard"}>
              <Icons.download className="size-4" aria-hidden />
              {saving ? "Saving" : item.source_pdf ? "Download this page" : "Download"}
            </Button>
          ) : null}
          {item.source_pdf ? (
            <Button variant="secondary" size="sm" onClick={savePdf} disabled={savingPdf} aria-label="Download the entire PDF">
              <Icons.download className="size-4" aria-hidden />
              {savingPdf ? "Saving" : "Download the entire PDF"}
            </Button>
          ) : null}
          <Button ref={closeRef} variant="outline" size="sm" onClick={onClose} aria-label="Close picture">
            <Icons.close className="size-4" aria-hidden />
            Close
          </Button>
        </div>
      </div>

      {failed ? (
        <p role="alert" className="border-b border-danger-500/40 bg-danger-500/10 px-4 py-2 text-xs font-semibold text-danger-400">
          The download did not work. Check your connection and try again.
        </p>
      ) : null}

      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pictureUrl(item.image_path)} alt={item.caption || label(item)} className="max-h-full max-w-full rounded-control object-contain" />
      </div>

      {many ? (
        <div className="flex items-center justify-center gap-3 border-t border-steel-700/60 px-4 py-3">
          <Button variant="outline" onClick={() => onIndex(stepIndex(index, -1, items.length))} aria-label="Previous picture">
            <Icons.arrowLeft className="size-4" aria-hidden />
            Previous
          </Button>
          <Button variant="primary" onClick={() => onIndex(stepIndex(index, 1, items.length))} aria-label="Next picture">
            Next
            <Icons.arrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
