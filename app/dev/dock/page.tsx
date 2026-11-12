import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DockButtonDemo, DockDemo } from "@/components/ui/dock-demo";

export const metadata = { title: "Dock (dev only)", robots: { index: false } };

export default function DockDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-12 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Dock</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Page links, centred</h2>
        <div className="flex justify-center pt-8">
          <DockDemo current="/quizzes" />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Button items</h2>
        <div className="pt-8">
          <DockButtonDemo />
        </div>
      </section>
    </main>
  );
}