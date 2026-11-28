"use client";

import * as React from "react";
import { SubjectSyllabusButton } from "@/components/exams/subject-syllabus-button";
import { loadSubjectSyllabi } from "@/lib/syllabus-files";
import { SYLLABUS_TOPICS } from "@/lib/syllabus-topics";
import { EXAMS, type ExamId } from "@/lib/subjects";

/** Inside an exam folder: one button per subject to download that subject's syllabus. Shows only the subjects an admin has uploaded. */
export function ExamSyllabusPanel({ exam }: { exam: string | null }) {
  const [loaded, setLoaded] = React.useState<{ exam: string; files: Record<string, string> } | null>(null);
  const known = EXAMS.some((e) => e.id === exam);

  React.useEffect(() => {
    let active = true;
    if (exam && known) {
      loadSubjectSyllabi(exam as ExamId).then((files) => {
        if (active) setLoaded({ exam, files });
      });
    }
    return () => {
      active = false;
    };
  }, [exam, known]);

  if (!exam || !known || loaded?.exam !== exam) return null;
  const subjects = SYLLABUS_TOPICS[exam as ExamId].filter((s) => loaded.files[s.slug]);
  if (subjects.length === 0) return null;
  const name = exam.toUpperCase();

  return (
    <section aria-label={`${name} syllabus by subject`} className="rounded-panel border border-steel-700 bg-navy-900 p-4">
      <h3 className="font-display text-xl font-bold text-white">{name} syllabus, subject by subject</h3>
      <p className="mt-1 text-sm text-steel-300">Download the official syllabus of any one subject as a PDF.</p>
      <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
        {subjects.map((s) => (
          <li key={s.slug}>
            <SubjectSyllabusButton exam={name} subject={s.name} path={loaded.files[s.slug]} label={s.name} />
          </li>
        ))}
      </ul>
    </section>
  );
}
