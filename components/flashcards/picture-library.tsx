"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { PictureViewer } from "@/components/flashcards/picture-viewer";
import { downloadChapterPdf } from "@/components/flashcards/download";
import { pictureUrl } from "@/components/flashcards/picture-url";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { IMAGE_COLUMNS, recentPictures, type FlashcardImage } from "@/lib/flashcard-images";
import { supabase } from "@/lib/supabaseClient";
import { chapterPdfName, pictureFileName } from "@/lib/flashcard-download";
import { BackButton, plural, SubjectFolderCard } from "@/components/vault/folder-parts";
import { buildFolders, itemInExam, subjectInExam } from "@/lib/taxonomy";
import { Icons } from "@/components/ui/icons";

interface Open {
  items: FlashcardImage[];
  index: number;
}

function Tile({ item, name, onOpen }: { item: FlashcardImage; name: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open picture: ${name}`}
      className="group overflow-hidden rounded-panel border border-steel-700/60 bg-navy-900 text-left transition-colors hover:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
    >
      <div className="aspect-4/3 w-full bg-navy-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pictureUrl(item.image_path)} alt={item.caption || name} loading="lazy" className="size-full object-contain" />
      </div>
      <p className="truncate px-3 py-2 font-mono text-xs text-steel-300">{name}</p>
    </button>
  );
}

const LOOSE = "loose";

interface Place {
  subjectId: string;
  /** A chapter id, LOOSE for cards filed under the subject only, or null for the chapter list. */
  chapter: string | null;
}

/** Picture flashcards for students: recently added, then Subject folders, Chapters and the pictures. Open to everyone. */
export function PictureLibrary({ exam = null, showRecent = true }: { exam?: string | null; showRecent?: boolean } = {}) {
  const [allPictures, setPictures] = React.useState<FlashcardImage[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [place, setPlace] = React.useState<Place | null>(null);
  const [open, setOpen] = React.useState<Open | null>(null);
  const [building, setBuilding] = React.useState(false);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const taxonomy = useTaxonomy();

  React.useEffect(() => {
    let active = true;
    supabase
      .from("flashcard_images")
      .select(IMAGE_COLUMNS)
      .order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (!active) return;
        // A missing table just means pictures have not been set up yet: show the empty state, not a red error.
        const notSetUp = loadError?.code === "PGRST205" || /schema cache|does not exist/i.test(loadError?.message ?? "");
        if (loadError && !notSetUp) setError(loadError.message);
        setPictures(loadError ? [] : ((data ?? []) as FlashcardImage[]));
      });
    return () => {
      active = false;
    };
  }, []);

  const go = React.useCallback((next: Place | null) => {
    setPlace(next);
    setPdfError(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const nameOf = React.useCallback(
    (item: FlashcardImage) => {
      const s = taxonomy.subjects.find((x) => x.id === item.subject_id)?.name;
      const c = taxonomy.chapters.find((x) => x.id === item.chapter_id)?.name;
      return [s, c].filter(Boolean).join(" > ") || "Flashcard";
    },
    [taxonomy.subjects, taxonomy.chapters],
  );

  // Under an exam, show the pictures for everyone plus those tagged for that exam.
  const pictures = React.useMemo(() => (allPictures ? allPictures.filter((p) => itemInExam(p.exams, exam)) : null), [allPictures, exam]);

  // Every subject is a folder, even with nothing inside. "Unsorted" is a holding area, so it hides once empty.
  const folders = React.useMemo(
    () => buildFolders(pictures ?? [], taxonomy.subjects, taxonomy.chapters).filter(
        (f) => (f.count > 0 || f.subject.name !== "Unsorted") && subjectInExam(f.subject, allPictures ?? [], exam),
      ),
    [pictures, allPictures, exam, taxonomy.subjects, taxonomy.chapters],
  );

  const recent = React.useMemo(() => recentPictures(pictures ?? []), [pictures]);

  if (pictures === null || taxonomy.loading) {
    return (
      <SkeletonGroup label="Loading flashcards" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-4/3 w-full rounded-panel" />
        ))}
      </SkeletonGroup>
    );
  }

  const folder = place ? folders.find((f) => f.subject.id === place.subjectId) : undefined;
  const errorBox = error ? (
    <p role="alert" className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400">
      Flashcards could not be loaded: {error}
    </p>
  ) : null;

  // Inside a chapter: the pictures.
  if (place && folder && place.chapter) {
    const isLoose = place.chapter === LOOSE;
    const chapterName = isLoose ? "General" : (folder.chapters.find((c) => c.id === place.chapter)?.name ?? "Chapter");
    const items = pictures
      .filter((p) => p.subject_id === folder.subject.id && (isLoose ? !folder.chapters.some((c) => c.id === p.chapter_id) : p.chapter_id === place.chapter))
      // Oldest first inside a chapter: the order an admin added them in.
      .reverse();
    return (
      <div className="space-y-6">
        {errorBox}
        <div className="flex flex-wrap items-center gap-3">
          <BackButton label={folder.subject.name} onClick={() => go({ subjectId: folder.subject.id, chapter: null })} />
          <h2 className="text-xl font-bold tracking-tight text-white">
            {folder.subject.name} <span className="text-steel-500">/</span> {chapterName}
          </h2>
        </div>
        {items.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              disabled={building}
              onClick={async () => {
                setBuilding(true);
                setPdfError(null);
                try {
                  await downloadChapterPdf(items, chapterPdfName(folder.subject.name, chapterName));
                } catch {
                  setPdfError("The PDF could not be built. Check your connection and try again.");
                } finally {
                  setBuilding(false);
                }
              }}
            >
              <Icons.download className="size-4" aria-hidden />
              {building ? "Building PDF" : "Download chapter as PDF"}
            </Button>
            <span className="font-mono text-xs text-steel-300">{plural(items.length, "card")}. Open a card to save it on its own.</span>
          </div>
        ) : null}
        {pdfError ? (
          <p role="alert" className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400">
            {pdfError}
          </p>
        ) : null}
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-bold text-white">No flashcards in this chapter yet</p>
              <p className="mt-2 text-sm text-steel-300">They show up here as soon as they are added.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item, i) => (
              <Tile key={item.id} item={item} name={chapterName} onOpen={() => setOpen({ items, index: i })} />
            ))}
          </div>
        )}
        {open ? (
          <PictureViewer
            items={open.items}
            index={open.index}
            label={nameOf}
            fileName={(item, i) => pictureFileName(folder.subject.name, isLoose ? null : chapterName, item.source_page ?? i + 1, item.image_path)}
            onIndex={(index) => setOpen({ ...open, index })}
            onClose={() => setOpen(null)}
          />
        ) : null}
      </div>
    );
  }

  // Inside a subject: the chapter list.
  if (place && folder) {
    const rows = [
      ...(folder.looseCount > 0 ? [{ id: LOOSE, name: "General", count: folder.looseCount }] : []),
      ...folder.chapters,
    ];
    return (
      <div className="space-y-6">
        {errorBox}
        <div className="flex flex-wrap items-center gap-3">
          <BackButton label="All subjects" onClick={() => go(null)} />
          <h2 className="text-xl font-bold tracking-tight text-white">{folder.subject.name}</h2>
        </div>
        {rows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-bold text-white">No chapters yet</p>
              <p className="mt-2 text-sm text-steel-300">Chapters for {folder.subject.name} will appear here once they are added.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid list-none gap-3 p-0 md:grid-cols-2">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => go({ subjectId: folder.subject.id, chapter: row.id })}
                  className="flex w-full items-center justify-between gap-3 rounded-panel border border-steel-700/60 bg-navy-900 px-4 py-3 text-left transition-colors hover:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-white">{row.name}</span>
                  <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-steel-300">
                    {row.count === 0 ? "Empty" : plural(row.count, "card")}
                    <Icons.chevronRight className="size-4" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Top level: recently added, then every subject folder.
  return (
    <div className="space-y-10">
      {errorBox}

      {showRecent && recent.length > 0 ? (
        <section aria-label="Recently added" className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-white">Recently added</h2>
            <Badge variant="gold">New</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recent.map((item, i) => (
              <Tile key={item.id} item={item} name={nameOf(item)} onOpen={() => setOpen({ items: recent, index: i })} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="Subjects" className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-white">Subjects</h2>
        {folders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-bold text-white">No subjects yet</p>
              <p className="mt-2 text-sm text-steel-300">Subjects show up here as soon as they are added. Check back soon.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {folders.map((f) => (
              <SubjectFolderCard key={f.subject.id} folder={f} onOpen={() => go({ subjectId: f.subject.id, chapter: null })} />
            ))}
          </div>
        )}
      </section>

      {open ? <PictureViewer items={open.items} index={open.index} label={nameOf} fileName={(item, i) => pictureFileName(nameOf(item), null, item.source_page ?? i + 1, item.image_path)} onIndex={(index) => setOpen({ ...open, index })} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
