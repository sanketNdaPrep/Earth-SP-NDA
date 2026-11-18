"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { PictureViewer } from "@/components/flashcards/picture-viewer";
import { pictureUrl } from "@/components/flashcards/picture-url";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { IMAGE_COLUMNS, recentPictures, type FlashcardImage } from "@/lib/flashcard-images";
import { supabase } from "@/lib/supabaseClient";
import { groupBySubject } from "@/lib/taxonomy";

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

/** Picture flashcards for students: recently added, then Subject, Chapter and the pictures. Open to everyone. */
export function PictureLibrary() {
  const [pictures, setPictures] = React.useState<FlashcardImage[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [subject, setSubject] = React.useState("all");
  const [open, setOpen] = React.useState<Open | null>(null);
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

  const nameOf = React.useCallback(
    (item: FlashcardImage) => {
      const s = taxonomy.subjects.find((x) => x.id === item.subject_id)?.name;
      const c = taxonomy.chapters.find((x) => x.id === item.chapter_id)?.name;
      return [s, c].filter(Boolean).join(" > ") || "Flashcard";
    },
    [taxonomy.subjects, taxonomy.chapters],
  );

  const chips = React.useMemo(() => {
    const used = new Set((pictures ?? []).map((p) => p.subject_id));
    return taxonomy.subjects.filter((s) => used.has(s.id));
  }, [pictures, taxonomy.subjects]);

  const recent = React.useMemo(() => recentPictures(pictures ?? []), [pictures]);

  const sections = React.useMemo(
    () =>
      groupBySubject(pictures ?? [], taxonomy.subjects, taxonomy.chapters)
        .filter((section) => subject === "all" || section.subjectId === subject)
        // The library keeps the order an admin added them in: oldest first inside a chapter.
        .map((section) => ({ ...section, chapters: section.chapters.map((g) => ({ ...g, items: [...g.items].reverse() })) })),
    [pictures, taxonomy.subjects, taxonomy.chapters, subject],
  );

  if (pictures === null) {
    return (
      <SkeletonGroup label="Loading flashcards" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-4/3 w-full rounded-panel" />
        ))}
      </SkeletonGroup>
    );
  }

  return (
    <div className="space-y-10">
      {error ? (
        <p role="alert" className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400">
          Flashcards could not be loaded: {error}
        </p>
      ) : null}

      {pictures.length === 0 && !error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-bold text-white">No flashcards yet</p>
            <p className="mt-2 text-sm text-steel-300">Flashcards show up here as soon as they are added. Check back soon.</p>
          </CardContent>
        </Card>
      ) : null}

      {pictures.length > 0 ? (
        <>
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

          <div role="group" aria-label="Filter by subject" className="flex flex-wrap gap-2">
            {[{ id: "all", name: "All subjects" }, ...chips].map((chip) => (
              <Button key={chip.id} size="sm" variant={subject === chip.id ? "primary" : "outline"} aria-pressed={subject === chip.id} onClick={() => setSubject(chip.id)}>
                {chip.name}
              </Button>
            ))}
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.key} aria-label={section.subjectName} className="space-y-6">
                <h2 className="border-b border-steel-700/60 pb-2 text-xl font-bold tracking-tight text-white">{section.subjectName}</h2>
                {section.chapters.map((group) => (
                  <div key={group.key} className="space-y-4">
                    {group.chapterName ? <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{group.chapterName}</h3> : null}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {group.items.map((item, i) => (
                        <Tile key={item.id} item={item} name={group.chapterName ?? section.subjectName} onOpen={() => setOpen({ items: group.items, index: i })} />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </>
      ) : null}

      {open ? <PictureViewer items={open.items} index={open.index} label={nameOf} onIndex={(index) => setOpen({ ...open, index })} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
