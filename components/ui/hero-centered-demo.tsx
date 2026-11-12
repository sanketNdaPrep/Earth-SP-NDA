import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroCentered, InlinePill } from "@/components/ui/hero-centered";
import { Icons } from "@/components/ui/icons";

/** Every part used: pills in the headline, description, two buttons, a note and the grid. */
export function HeroCenteredDemo() {
  return (
    <HeroCentered
      grid
      headingLevel="h2"
      heading={
        <>
          Prepare for <InlinePill label="NDA" icon={<Icons.shield />} tone="emerald" suffix="," />{" "}
          <InlinePill label="CDS" icon={<Icons.target />} suffix="," /> and{" "}
          <InlinePill label="AFCAT" icon={<Icons.plane />} tone="gold" /> in one place.
        </>
      }
      description="Free notes and timed mock tests for aspirants who study on their own."
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
      note="Pick a topic, take a timed test, then review your mistakes."
    />
  );
}

/** Heading and description only, with plain text and no grid. */
export function HeroCenteredMinimalDemo() {
  return (
    <HeroCentered
      headingLevel="h2"
      heading="Know the syllabus before you start"
      description="A short, honest map of what each exam asks."
    />
  );
}