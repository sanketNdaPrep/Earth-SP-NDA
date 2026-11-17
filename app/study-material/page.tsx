import type { Metadata } from "next";
import Link from "next/link";
import { MaterialLibrary } from "@/components/study-material/material-library";
import { Badge } from "@/components/ui/badge";
import { AdminShortcut } from "@/components/landing/admin-shortcut";
import { pageMeta } from "@/lib/seo";
import { SiteMenu } from "@/components/landing/site-menu";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export const metadata: Metadata = pageMeta("Free Study Material", "Free notes, flashcards and papers for NDA, CDS and AFCAT revision.");

/** Public page behind the "Get Free Study Material" button. Anyone can download. */
export default function StudyMaterialPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-steel-100">
      <header className="border-b border-steel-700 bg-navy-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <SiteMenu />
            <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-white">
              <Icons.logo className="size-6 text-gold-400" />
              <span>EARTH SP NDA</span>
            </Link>
          </div>
          <div className="flex gap-2">
            <AdminShortcut href="/admin/resources" label="Manage" />
            <Button asChild variant="outline" size="sm">
              <Link href="/flashcards">Flashcards</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-8">
        <div>
          <Badge variant="gold" className="mb-3">Free Resources</Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">Free Study Material</h1>
          <p className="mt-2 max-w-2xl text-pretty text-steel-300">
            Notes, flashcards and papers for NDA, CDS and AFCAT. Search, pick a category and download.
          </p>
        </div>
        <MaterialLibrary />
        <p className="border-l-2 border-gold-400 bg-navy-900/60 py-3 pl-4 pr-3 text-xs text-steel-300">
          Use these as revision aids. They do not replace the official syllabus, so check dates and eligibility on the
          official exam websites.
        </p>
      </main>
    </div>
  );
}
