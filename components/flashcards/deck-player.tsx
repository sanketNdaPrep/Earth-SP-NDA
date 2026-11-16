"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { shuffled, type Card, type Deck } from "@/lib/flashcards";
import { supabase } from "@/lib/supabaseClient";

type Loaded = { deck: Deck; cards: Card[] } | { missing: true };

/**
 * Studies one deck. Tap the card to flip it, then say whether you knew it.
 * Cards you missed come round again in the next pass. Progress stays on this page.
 */
export function DeckPlayer({ deckId }: { deckId: string }) {
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [queue, setQueue] = React.useState<Card[]>([]);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState(0);
  const [missed, setMissed] = React.useState<Card[]>([]);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("flashcard_decks").select("id, title, category, description, created_at").eq("id", deckId).maybeSingle(),
      supabase.from("flashcards").select("id, front, back, position").eq("deck_id", deckId).order("position", { ascending: true }),
    ]).then(([deckResult, cardsResult]) => {
      if (!active) return;
      if (deckResult.error || cardsResult.error) {
        setError((deckResult.error ?? cardsResult.error)?.message ?? "Could not load this deck.");
        return;
      }
      if (!deckResult.data) {
        setLoaded({ missing: true });
        return;
      }
      const cards = (cardsResult.data ?? []) as Card[];
      setLoaded({ deck: deckResult.data as Deck, cards });
      setQueue(cards);
    });
    return () => {
      active = false;
    };
  }, [deckId]);

  const restart = (cards: Card[], mix: boolean) => {
    setQueue(mix ? shuffled(cards) : cards);
    setMissed([]);
    setKnown(0);
    setFlipped(false);
  };

  const answer = (gotIt: boolean) => {
    const [current, ...rest] = queue;
    if (!current) return;
    if (gotIt) setKnown((n) => n + 1);
    else setMissed((m) => [...m, current]);
    setQueue(rest);
    setFlipped(false);
  };

  if (error) {
    return (
      <p role="alert" className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-sm font-semibold text-danger-400">
        {error}
      </p>
    );
  }
  if (!loaded) return <Skeleton aria-hidden="true" className="h-72 w-full rounded-panel" />;
  if ("missing" in loaded) {
    return (
      <div className="space-y-4">
        <p className="text-lg font-bold text-white">This deck was not found</p>
        <Button asChild variant="outline"><Link href="/flashcards">Back to all decks</Link></Button>
      </div>
    );
  }

  const { deck, cards } = loaded;
  const total = cards.length;
  const current = queue[0];
  const done = total - queue.length - missed.length;

  if (total === 0) {
    return <p className="text-sm text-steel-300">This deck has no cards yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold" className="mb-3">{deck.category}</Badge>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white">{deck.title}</h1>
        {deck.description ? <p className="mt-2 text-steel-300">{deck.description}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-4 font-mono text-xs text-steel-300">
        <span aria-live="polite">{known} known · {missed.length} to review · {queue.length} left</span>
        <Button size="sm" variant="outline" onClick={() => restart(cards, true)}>
          Shuffle and restart
        </Button>
      </div>

      {current ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Showing the answer. Press to show the question." : "Showing the question. Press to show the answer."}
            className="flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-panel border border-steel-700 bg-navy-900 p-8 text-center shadow-panel transition-colors hover:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
          >
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{flipped ? "Answer" : "Question"}</span>
            <span className="text-balance text-2xl font-semibold text-white">{flipped ? current.back : current.front}</span>
            <span className="text-xs text-steel-500">Tap to {flipped ? "see the question" : "see the answer"}</span>
          </button>

          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" disabled={!flipped} onClick={() => answer(false)}>Need another look</Button>
            <Button variant="primary" disabled={!flipped} onClick={() => answer(true)}>I knew it</Button>
          </div>
          <p className="text-center text-xs text-steel-500">Card {Math.min(done + 1, total)} of {total} in this pass</p>
        </div>
      ) : (
        <div className="space-y-4 rounded-panel border border-steel-700 bg-navy-900 p-8 text-center shadow-panel">
          <p className="text-2xl font-bold text-white">{missed.length === 0 ? "Deck complete" : "Pass complete"}</p>
          <p className="text-sm text-steel-300">
            You knew {known} of {total} cards{missed.length > 0 ? `, and ${missed.length} need another look.` : "."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {missed.length > 0 ? <Button variant="primary" onClick={() => restart(missed, true)}>Review the {missed.length} missed</Button> : null}
            <Button variant="outline" onClick={() => restart(cards, true)}>Study the whole deck again</Button>
            <Button asChild variant="outline"><Link href="/flashcards">All decks</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
