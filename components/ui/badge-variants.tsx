import * as React from "react";
import { Badge } from "@/components/ui/badge";

/** The reference row: one badge per variant, with portal labels. */
export function BadgeVariants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Mock test</Badge>
      <Badge variant="gold">NDA Maths</Badge>
      <Badge variant="emerald">Completed</Badge>
      <Badge variant="danger">Needs review</Badge>
      <Badge variant="outline">Free</Badge>
      <Badge variant="ghost">Optional</Badge>
    </div>
  );
}

/** shadcn-style names still work: secondary is neutral, destructive is danger. */
export function BadgeAliases() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">Revision</Badge>
      <Badge variant="destructive">Overdue</Badge>
    </div>
  );
}

/** Solid emphasis for gold, emerald and danger. */
export function BadgeSolidVariants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="gold" solid>New</Badge>
      <Badge variant="emerald" solid>Passed</Badge>
      <Badge variant="danger" solid>Failed</Badge>
    </div>
  );
}

/** Leading dots. The text carries the meaning; the dot only repeats the colour. */
export function BadgeDotVariants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="emerald" dot>Live</Badge>
      <Badge variant="gold" dot>In progress</Badge>
      <Badge variant="danger" dot>Test closed</Badge>
      <Badge variant="outline" dot>Draft</Badge>
    </div>
  );
}

export default BadgeVariants;