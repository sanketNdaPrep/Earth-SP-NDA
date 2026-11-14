import type { Metadata } from "next";
import Link from "next/link";
import { LandingProviders } from "@/components/landing-data";
import { Vault } from "@/components/vault";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Free Study Material",
  description: "Free PDFs and images for NDA, CDS and AFCAT revision.",
};

/** Public page behind the "Get Free Study Material" button. Anyone can download. */
export default function StudyMaterialPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-steel-100">
      <header className="border-b border-steel-700 bg-navy-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-white">
            <Icons.logo className="size-6 text-gold-400" />
            <span>EARTH SP NDA</span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </header>
      <main>
        <LandingProviders>
          <Vault />
        </LandingProviders>
      </main>
    </div>
  );
}
