import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { HeroCenteredDemo, HeroCenteredMinimalDemo } from "@/components/ui/hero-centered-demo";

export const metadata = { title: "Hero centred (dev only)", robots: { index: false } };

export default function HeroCenteredDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="flex min-h-dvh w-full flex-col gap-12 bg-navy-950 py-12 text-steel-100">
      <div className="flex items-center gap-3 px-5">
        <h1 className="text-2xl font-semibold text-white">Hero centred</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="px-5 font-mono text-xs uppercase tracking-wider text-steel-300">With inline pills, grid and buttons</h2>
        <HeroCenteredDemo />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="px-5 font-mono text-xs uppercase tracking-wider text-steel-300">Minimal: plain text</h2>
        <HeroCenteredMinimalDemo />
      </section>
    </main>
  );
}