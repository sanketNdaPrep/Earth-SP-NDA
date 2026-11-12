import { notFound } from "next/navigation";
import { TimelineDemo } from "@/components/ui/timeline-demo";

export const metadata = { title: "Timeline (dev only)", robots: { index: false } };

export default function TimelineDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="min-h-screen overflow-x-clip">
      <TimelineDemo />
    </main>
  );
}