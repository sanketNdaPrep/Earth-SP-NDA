import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeckPlayer } from "@/components/flashcards/deck-player";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Flashcards" };

// One placeholder keeps the build able to prerender the page shell; real ids are rendered on request.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

async function DeckContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DeckPlayer deckId={id} />;
}

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-navy-950 text-steel-100">
      <header className="border-b border-steel-700 bg-navy-950/80">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-wider text-white">
            <Icons.logo className="size-6 text-gold-400" />
            <span className="whitespace-nowrap">EARTH SP NDA</span>
          </Link>
          <Button asChild variant="outline" size="sm"><Link href="/flashcards">All decks</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <Suspense fallback={null}>
          <DeckContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}
