import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProgressEdgeDemo, ProgressTonesDemo, ProgressValuesDemo } from "@/components/ui/progress-demo";

export const metadata = { title: "Progress (dev only)", robots: { index: false } };

export default function ProgressDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Progress</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      {/* The demo sets the width; the bar itself fills its container */}
      <section className="flex max-w-md flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Values</h2>
        <ProgressValuesDemo />
      </section>

      <section className="flex max-w-md flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Tones and sizes</h2>
        <ProgressTonesDemo />
      </section>

      <section className="flex max-w-md flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Loading and edge values</h2>
        <ProgressEdgeDemo />
      </section>
    </main>
  );
}