import { notFound } from "next/navigation";
import { BorderBeamDemo } from "@/components/ui/border-beam-demo";

export const metadata = { title: "Border beam (dev only)", robots: { index: false } };

export default function BorderBeamDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-navy-950 text-steel-100 flex min-h-screen items-center justify-center px-6 py-12">
      <BorderBeamDemo />
    </main>
  );
}