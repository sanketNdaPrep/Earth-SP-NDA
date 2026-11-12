import type { Metadata } from "next";
import { NotFoundSection, type NotFoundLink } from "@/components/ui/not-found-section";

// Next.js already adds noindex to every not-found response, so only the title is set here.
export const metadata: Metadata = { title: "Page not found | EARTH SP NDA" };

const LINKS: NotFoundLink[] = [
  { label: "Practice tests", href: "/quizzes", description: "Timed mock tests for NDA, CDS and AFCAT." },
  { label: "Notes", href: "/#vault", description: "Free notes and study material." },
  { label: "Dashboard", href: "/dashboard", description: "Your scores and progress." },
];

export default function NotFound() {
  return <NotFoundSection links={LINKS} />;
}