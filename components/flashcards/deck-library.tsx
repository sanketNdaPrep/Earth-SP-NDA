"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { cardCount, type Deck } from "@/lib/flashcards";
import { supabase } from "@/lib/supabaseClient";

const COLUMNS = "id, title, category, description, created_at, flashcards(count)";

/** Every flashcard deck, with search and category filters. Open to everyone. */
export function DeckLibrary() {
  const [decks, setDecks] = React.useState<Deck[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");

  React.useEffect(() => {
    let active = true;
    supabase
      .from("flashcard_decks")
      .select(COLUMNS)
      .order("created_at", { ascending: true })
      .then(({ data, error: loadError }) => {
        if (!active) return;
        // A missing table just means the decks have not been set up yet: show the empty state, not a red error.
        const notSetUp = loadError?.code === "PGRST205" || /schema cache|does not exist/i.test(loadError?.message ?? "");
        if (loadError && !notSetUp) setError(loadError.message);
        setDecks(loadError ? [] : ((data ?? []) as unknown as Deck[]));
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = React.useMemo(() => [...new Set((decks ?? []).map((d) => d.category))].sort((a, b) => a.localeCompare(b)), [decks]);

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (decks ?? []).filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      return !q || [d.title, d.description, d.category].some((field) => field.toLowerCase().includes(q));
    });
  }, [decks, search, category]);

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
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
              {["all", ...categories].map((name) => (
                <Button key={name} size="sm" variant={category === name ? "primary" : "outline"} aria-pressed={category === name} onClick={() => setCategory(name)}>
                  {name === "all" ? "All" : name}
                </Button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-steel-300">No decks match your search.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((deck) => (
                <Card key={deck.id} className="flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="gold">{deck.category}</Badge>
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
          )}
        </>
      ) : null}
    </div>
  );
}
