import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SkeletonToggleDemo } from "@/components/ui/skeleton-demo";
import { SkeletonCard, SkeletonList, SkeletonText } from "@/components/ui/skeleton-card";

export const metadata = { title: "Skeleton (dev only)", robots: { index: false } };

export default function SkeletonDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Skeleton</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Card, skeleton versus loaded</h2>
        <SkeletonToggleDemo />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Grid of cards</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonCard label="Loading mock tests" />
          <SkeletonCard label="Loading notes" lines={3} media={false} />
          <SkeletonCard label="Loading papers" animation="shimmer" />
        </div>
      </section>

      <section className="flex max-w-md flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">List</h2>
        <SkeletonList label="Loading your recent attempts" rows={4} />
      </section>

      <section className="flex max-w-md flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Text, with shimmer</h2>
        <SkeletonText label="Loading instructions" lines={4} animation="shimmer" />
      </section>
    </main>
  );
}