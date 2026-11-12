import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSplit } from "@/components/ui/hero-split";
import { Icons } from "@/components/ui/icons";
import { RadialProgress } from "@/components/ui/radial-progress";

const SAMPLE_STATS = [
  { value: "3", label: "exams covered" },
  { value: "20", label: "mock tests" },
  { value: "Free", label: "to use" },
];

/** Every part used: eyebrow link, accented heading, buttons, stats and a ring in the visual slot. */
export function HeroSplitDemo() {
  return (
    <HeroSplit
      headingLevel="h2"
      eyebrow={{ text: "New: free mock tests", href: "/quizzes" }}
      heading="Study with a"
      accent="system"
      description="Free notes and timed mock tests for NDA, CDS and AFCAT aspirants who study on their own."
      actions={
        <>
          <Button size="lg" asChild>
            <Link href="/quizzes">
              Take a practice test
              <Icons.arrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/#vault">Browse free notes</Link>
          </Button>
        </>
      }
      stats={SAMPLE_STATS}
      visual={
        <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-panel border border-steel-700 bg-navy-900 p-8 shadow-panel">
          <RadialProgress label="Syllabus covered" value={64} size="lg" tone="gold" />
          <p className="text-center text-sm text-steel-300">Syllabus covered (sample)</p>
        </div>
      }
    />
  );
}

/** Heading and description only: no visual, so the text takes the full width. */
export function HeroSplitMinimalDemo() {
  return (
    <HeroSplit
      headingLevel="h2"
      heading="Know the syllabus before you start"
      description="A short, honest map of what each exam asks."
    />
  );
}