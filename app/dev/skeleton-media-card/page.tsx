import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SkeletonMediaToggleDemo } from "@/components/ui/skeleton-demo";
import { SkeletonMediaCard } from "@/components/ui/skeleton-media-card";

export const metadata = { title: "Skeleton media card (dev only)", robots: { index: false } };

export default function SkeletonMediaCardDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Skeleton media card</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Tile, skeleton versus loaded</h2>
        <SkeletonMediaToggleDemo testId="media-slot" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Bordered, skeleton versus loaded</h2>
        <SkeletonMediaToggleDemo bordered testId="media-slot-bordered" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Grid of tiles</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <SkeletonMediaCard label="Loading papers" />
          <SkeletonMediaCard label="Loading notes" lines={3} animation="shimmer" />
          <SkeletonMediaCard label="Loading videos" bordered lines={1} />
        </div>
      </section>
    </main>
  );
}