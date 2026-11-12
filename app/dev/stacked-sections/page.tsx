import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { StackedSectionsDemo } from "@/components/ui/stacked-sections-demo";

export const metadata = { title: "Stacked sections (dev only)", robots: { index: false } };

export default function StackedSectionsDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="min-h-dvh w-full bg-navy-950 text-steel-100">
      <header className="mx-auto flex max-w-3xl flex-col items-start gap-3 px-4 py-12 sm:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">Stacked sections</h1>
          <Badge variant="outline">Sample copy</Badge>
        </div>
        <p className="text-sm text-steel-300">Scroll down. Each section sticks, and the next one slides over it.</p>
      </header>
      <StackedSectionsDemo />
      <footer className="mx-auto max-w-3xl px-4 py-12 text-sm text-steel-300 sm:px-8">
        End of the stack. Normal page content continues here.
      </footer>
    </main>
  );
}