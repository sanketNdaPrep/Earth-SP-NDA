import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { HeroSplitDemo, HeroSplitMinimalDemo } from "@/components/ui/hero-split-demo";

export const metadata = { title: "Hero split (dev only)", robots: { index: false } };

export default function HeroSplitDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="flex min-h-dvh w-full flex-col gap-12 bg-navy-950 py-12 text-steel-100">
      <div className="flex items-center gap-3 px-5">
        <h1 className="text-2xl font-semibold text-white">Hero split</h1>
        <Badge variant="outline">Sample data</Badge>
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="px-5 font-mono text-xs uppercase tracking-wider text-steel-300">All parts</h2>
        <HeroSplitDemo />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="px-5 font-mono text-xs uppercase tracking-wider text-steel-300">Minimal: text only</h2>
        <HeroSplitMinimalDemo />
      </section>
    </main>
  );
}