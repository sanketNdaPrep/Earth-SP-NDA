"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { cardCount, type Deck } from "@/lib/flashcards";
import { groupBySubject } from "@/lib/taxonomy";
import { supabase } from "@/lib/supabaseClient";

const COLUMNS = "id, title, category, description, created_at, subject_id, chapter_id, flashcards(count)";
// Used until migration 013 has been run: decks load, they are just not filed under subjects yet.
const OLD_COLUMNS = "id, title, category, description, created_at, flashcards(count)";

/** Every flashcard deck, with search and category filters. Open to everyone. */
export function DeckLibrary() {
  const [decks, setDecks] = React.useState<Deck[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      type Result = { data: unknown; error: { code?: string; message: string } | null };
      let result: Result = await supabase.from("flashcard_decks").select(COLUMNS).order("created_at", { ascending: true });
      if (result.error && /subject_id|chapter_id/.test(result.error.message)) {
        result = await supabase.from("flashcard_decks").select(OLD_COLUMNS).order("created_at", { ascending: true });
      }
      if (!active) return;
      const { data, error: loadError } = result;
      // A missing table just means the decks have not been set up yet: show the empty state, not a red error.
      const notSetUp = loadError?.code === "PGRST205" || /schema cache|does not exist/i.test(loadError?.message ?? "");
      if (loadError && !notSetUp) setError(loadError.message);
      const rows = loadError ? [] : ((data ?? []) as unknown as Partial<Deck>[]);
      setDecks(rows.map((d) => ({ subject_id: null, chapter_id: null, ...d })) as Deck[]);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const taxonomy = useTaxonomy();

  const subjectChips = React.useMemo(() => {
    const used = new Set((decks ?? []).map((d) => d.subject_id).filter(Boolean));
    const named = taxonomy.subjects.filter((x) => used.has(x.id)).map((x) => ({ id: x.id, name: x.name }));
    const hasOther = (decks ?? []).some((d) => !d.subject_id || !taxonomy.subjects.some((x) => x.id === d.subject_id));
    return hasOther && named.length > 0 ? [...named, { id: "other", name: "Other" }] : named;
  }, [decks, taxonomy.subjects]);

  const sections = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const matching = (decks ?? []).filter((d) => !q || [d.title, d.description, d.category].some((field) => field.toLowerCase().includes(q)));
    return groupBySubject(matching, taxonomy.subjects, taxonomy.chapters).filter(
      (section) => category === "all" || (category === "other" ? section.subjectId === null : section.subjectId === category),
    );
  }, [decks, search, category, taxonomy.subjects, taxonomy.chapters]);

  if (decks === null) {
    return (
      <SkeletonGroup label="Loading flashcards" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-panel" />
        ))}
      </SkeletonGroup>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p role="alert" className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400">
          Flashcards could not be loaded: {error}
        </p>
      ) : null}

      {decks.length === 0 && !error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-bold text-white">No flashcard decks yet</p>
            <p className="mt-2 text-sm text-steel-300">Decks show up here as soon as they are added. Check back soon.</p>
          </CardContent>
        </Card>
      ) : null}

      {decks.length > 0 ? (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-sm">
              <label htmlFor="deck-search" className="sr-only">
                Search flashcard decks
              </label>
              <Input id="deck-search" type="search" placeholder="Search decks..." value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
            </div>
            <div role="group" aria-label="Filter by subject" className="flex flex-wrap gap-2">
              {[{ id: "all", name: "All" }, ...subjectChips].map((chip) => (
                <Button key={chip.id} size="sm" variant={category === chip.id ? "primary" : "outline"} aria-pressed={category === chip.id} onClick={() => setCategory(chip.id)}>
                  {chip.name}
                </Button>
              ))}
            </div>
          </div>

          {sections.length === 0 ? (
            <p className="text-sm text-steel-300">No decks match your search.</p>
          ) : (
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.key} aria-label={section.subjectName} className="space-y-6">
                  {sections.length > 1 || section.subjectId ? (
                    <h2 className="border-b border-steel-700/60 pb-2 text-xl font-bold tracking-tight text-white">{section.subjectName}</h2>
                  ) : null}
                  {section.chapters.map((group) => (
                    <div key={group.key} className="space-y-4">
                      {group.chapterName ? <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{group.chapterName}</h3> : null}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {group.items.map((deck) => (
                          <Card key={deck.id} className="flex flex-col justify-between">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="gold">{group.chapterName ?? section.subjectName}</Badge>
                                <span className="font-mono text-xs text-steel-300">{cardCount(deck)} cards</span>
                              </div>
                              <CardTitle className="mt-2 text-lg">{deck.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {deck.description ? <p className="text-sm text-steel-300">{deck.description}</p> : null}
                              <Button asChild variant="primary" className="w-full">
                                <Link href={`/flashcards/${deck.id}`}>Study this deck</Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
