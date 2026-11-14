import type { Metadata } from "next";
import { MaterialLibrary } from "@/components/study-material/material-library";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Study Materials" };

/** The same library the public page shows, inside the student dashboard. */
export default function StudyMaterialsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Revision Library</Badge>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Study Materials</h1>
        <p className="mt-1 text-sm text-steel-300">Notes, flashcards and papers uploaded by your instructors.</p>
      </div>
      <MaterialLibrary />
    </div>
  );
}
