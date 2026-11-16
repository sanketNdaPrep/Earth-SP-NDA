import type { Metadata } from "next";
import Link from "next/link";
import { DeckLibrary } from "@/components/flashcards/deck-library";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { SiteMenu } from "@/components/landing/site-menu";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Quick-recall flashcards for NDA, CDS and AFCAT: formulas, laws, chemistry basics and defence awareness.",
};

/** Public flashcard decks. No sign-in needed. */
export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-steel-100">
      <header className="border-b border-steel-700 bg-navy-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-white">
            <Icons.logo className="size-6 text-gold-400" />
            <span>EARTH SP NDA</span>
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link href="/study-material">Study material</Link></Button>
            <Button asChild variant="outline" size="sm"><Link href="/">Home</Link></Button>
            <SiteMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-8">
        <div>
          <Badge variant="gold" className="mb-3">Quick Recall</Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">Flashcards</h1>
          <p className="mt-2 max-w-2xl text-pretty text-steel-300">
            Short decks you can run through in a few minutes. Flip a card, say whether you knew it, and the ones you missed come back.
          </p>
        </div>
        <DeckLibrary />
      </main>
    </div>
  );
}
