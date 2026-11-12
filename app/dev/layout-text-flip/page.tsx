import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  LayoutTextFlipControlDemo,
  LayoutTextFlipDemo,
  LayoutTextFlipEdgeDemo,
  LayoutTextFlipFixedDemo,
} from "@/components/ui/layout-text-flip-demo";

export const metadata = { title: "Layout text flip (dev only)", robots: { index: false } };

export default function LayoutTextFlipDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Layout text flip</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">In a heading, with an outside button</h2>
        <LayoutTextFlipDemo />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Built-in pause button</h2>
        <LayoutTextFlipControlDemo />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Fixed width</h2>
        <LayoutTextFlipFixedDemo />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Single word and long words</h2>
        <LayoutTextFlipEdgeDemo />
      </section>
    </main>
  );
}