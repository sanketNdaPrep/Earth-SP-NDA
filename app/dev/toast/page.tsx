import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toast";
import { ToastExtras, ToastTypes } from "@/components/ui/toast-demo";

export const metadata = { title: "Toast (dev only)", robots: { index: false } };

export default function ToastDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Toast</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Types</h2>
        <ToastTypes />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Sticky, limit and clear</h2>
        <ToastExtras />
      </section>

      {/* The real app layout is not wired yet, so this page mounts its own Toaster */}
      <Toaster />
    </main>
  );
}