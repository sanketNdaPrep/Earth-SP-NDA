"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { subjectCoverUrl } from "@/components/flashcards/picture-url";
import type { SubjectFolder } from "@/lib/taxonomy";

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function SubjectFolderCard({ folder, onOpen, unit = "card" }: { folder: SubjectFolder; onOpen: () => void; unit?: string }) {
  const { subject } = folder;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-panel border border-steel-700/60 bg-navy-900 text-left transition-colors hover:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
    >
      <div className="flex aspect-4/3 w-full items-center justify-center bg-navy-950">
        {subject.cover_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={subjectCoverUrl(subject.cover_path)} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <Icons.book className="size-10 text-steel-500 transition-colors group-hover:text-gold-400" aria-hidden />
        )}
      </div>
      <div className="space-y-1 px-3 py-3">
        <p className="truncate text-sm font-bold text-white group-hover:text-gold-300">{subject.name}</p>
        <p className="font-mono text-xs text-steel-300">
          {folder.count === 0 && folder.chapters.length === 0 ? "Empty" : `${plural(folder.chapters.length, "chapter")}, ${plural(folder.count, unit)}`}
        </p>
      </div>
    </button>
  );
}

/** A small cover picture for a chapter row. Shows nothing when the chapter has no cover. */
export function ChapterThumb({ path }: { path?: string | null }) {
  if (!path) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={subjectCoverUrl(path)} alt="" loading="lazy" className="size-10 shrink-0 rounded-control border border-steel-700/60 object-cover" />;
}

export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Icons.arrowLeft className="size-4" aria-hidden />
      {label}
    </Button>
  );
}

