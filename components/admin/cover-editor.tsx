"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { subjectCoverUrl } from "@/components/flashcards/picture-url";
import { IMAGE_ACCEPT } from "@/lib/flashcard-images";

interface CoverEditorProps {
  /** What the picture is for, for screen readers: "Trigonometry". */
  label: string;
  coverPath: string | null | undefined;
  busy?: boolean;
  /** A new picture was chosen (file) or the cover was removed (null). */
  onChange: (file: File | null) => void | Promise<void>;
}

/** A small thumbnail with Add or Change cover and Remove cover buttons. */
export function CoverEditor({ label, coverPath, busy, onChange }: CoverEditorProps) {
  const input = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      {coverPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={subjectCoverUrl(coverPath)} alt="" className="size-10 shrink-0 rounded-control border border-steel-700 object-cover" />
      ) : (
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control border border-dashed border-steel-700 text-steel-500">
          <Icons.book className="size-4" aria-hidden />
        </span>
      )}
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        aria-label={`Cover picture for ${label}`}
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void onChange(file);
        }}
      />
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()} aria-label={`${coverPath ? "Change" : "Add"} cover for ${label}`}>
        {coverPath ? "Change cover" : "Add cover"}
      </Button>
      {coverPath ? (
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void onChange(null)} aria-label={`Remove cover of ${label}`}>
          Remove cover
        </Button>
      ) : null}
    </div>
  );
}
