import type { Metadata } from "next";
import Link from "next/link";
import { DeckLibrary } from "@/components/flashcards/deck-library";
import { AdminShortcut } from "@/components/landing/admin-shortcut";
import { SiteMenu } from "@/components/landing/site-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Quick-recall flashcards for NDA, CDS and AFCAT: formulas, laws, chemistry basics and defence awareness.",
};

/** Public flashcard decks, laid out like the Test Center. No sign-in needed. */
export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-navy-950 p-6 text-steel-100 md:p-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="flex flex-col gap-4 border-b border-steel-700/60 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="gold">Quick Recall</Badge>
            <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white">Flashcards</h1>
            <p className="mt-1 text-sm text-steel-300">Flip a card, say whether you knew it, and the ones you missed come back.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminShortcut href="/admin/flashcards" label="Manage decks" />
            <Button asChild variant="primary" size="sm">
              <Link href="/dashboard">Cadet Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Home</Link>
            </Button>
            <SiteMenu />
          </div>
        </header>
        <DeckLibrary />
      </div>
    </div>
  );
}
