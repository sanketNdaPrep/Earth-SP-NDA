import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { RadialGalleryDemo, RadialValuesDemo } from "@/components/ui/radial-progress-demo";

export const metadata = { title: "Radial progress (dev only)", robots: { index: false } };

export default function RadialProgressDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Radial progress</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Values</h2>
        <RadialValuesDemo />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Tones, sizes and custom centre</h2>
        <RadialGalleryDemo />
      </section>
    </main>
  );
}