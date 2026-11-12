import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { FabDemo, FabDirectionDemo } from "@/components/ui/fab-demo";

export const metadata = { title: "Floating action button (dev only)", robots: { index: false } };

export default function FabDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-12 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Floating action button</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Up and left, three actions</h2>
        <FabDemo />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Up, four actions</h2>
        <FabDirectionDemo direction="up" />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Up and right, two actions</h2>
        <FabDirectionDemo direction="up-right" />
      </section>
    </main>
  );
}