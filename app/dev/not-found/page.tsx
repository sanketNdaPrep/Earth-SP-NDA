import { notFound } from "next/navigation";
import { NotFoundSection, type NotFoundLink } from "@/components/ui/not-found-section";

export const metadata = { title: "Not found section (dev only)", robots: { index: false } };

/** Same links as the real 404 page, so the preview matches it. */
const LINKS: NotFoundLink[] = [
  { label: "Practice tests", href: "/quizzes", description: "Timed mock tests for NDA, CDS and AFCAT." },
  { label: "Notes", href: "/#vault", description: "Free notes and study material." },
  { label: "Dashboard", href: "/dashboard", description: "Your scores and progress." },
];

export default function NotFoundDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="flex flex-1 flex-col bg-navy-950 text-steel-100">
      <NotFoundSection links={LINKS} />
    </div>
  );
}