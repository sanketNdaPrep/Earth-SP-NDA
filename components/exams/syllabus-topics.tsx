"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { SubjectSyllabusButton } from "@/components/exams/subject-syllabus-button";
import { loadSubjectSyllabi } from "@/lib/syllabus-files";
import { SYLLABUS_TOPICS, topicCount } from "@/lib/syllabus-topics";
import type { ExamId } from "@/lib/subjects";

/** Every unit and topic of the exam's official syllabus, with a download button per subject once an admin has uploaded the PDF. */
export function SyllabusTopics({ examId, examName }: { examId: string; examName: string }) {
  const exam = examId as ExamId;
  const subjects = SYLLABUS_TOPICS[exam];
  const [files, setFiles] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    let active = true;
    if (subjects) {
      loadSubjectSyllabi(exam).then((f) => {
        if (active) setFiles(f);
      });
    }
    return () => {
      active = false;
    };
  }, [exam, subjects]);

  if (!subjects) return null;

  return (
    <Card id="syllabus" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Syllabus & Core Topics</CardTitle>
        <p className="mt-1 text-pretty text-sm leading-relaxed text-steel-300">
          Every unit and topic from the official {examName} syllabus, subject by subject. Open a subject to read it. Syllabus, pattern and dates can change, so check the latest notice on the official website
          ({examId === "afcat" ? "afcat.cdac.in" : "upsc.gov.in"}) before you apply.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {subjects.map((subject, i) => (
          <section key={subject.slug} className="rounded-control border border-steel-700/60 bg-navy-950">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">{subject.tag}</p>
                <h3 className="mt-0.5 font-display text-xl font-bold text-white">{subject.name}</h3>
              </div>
              <SubjectSyllabusButton exam={examId.toUpperCase()} subject={subject.name} path={files[subject.slug]} />
            </div>
            <details open={i === 0} className="group border-t border-steel-700/60">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-steel-100 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-400 [&::-webkit-details-marker]:hidden">
                <span>{topicCount(subject)} topics</span>
                <Icons.chevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="space-y-5 px-4 pb-4">
                {subject.units.map((unit, ui) => (
                  <div key={ui}>
                    {unit.title ? (
                      <h4 className="flex flex-wrap items-baseline gap-x-3 text-base font-bold text-white">
                        {unit.title}
                        {unit.note ? <span className="text-xs font-semibold text-steel-400">{unit.note}</span> : null}
                      </h4>
                    ) : null}
                    <ul className="mt-2 list-none space-y-3 p-0">
                      {unit.groups.map((g, gi) => (
                        <li key={gi} className="text-sm leading-relaxed text-steel-300">
                          {g.title ? <span className="font-semibold text-steel-100">{g.title}. </span> : null}
                          {g.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
