"use client";

import * as React from "react";
import Link from "next/link";
import { BackButton, plural, SubjectFolderCard } from "@/components/vault/folder-parts";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { EXAMS } from "@/lib/subjects";
import { supabase } from "@/lib/supabaseClient";
import { buildFolders, itemInExam, sortChapters, subjectInExam } from "@/lib/taxonomy";

type Kind = "notes" | "flashcards" | "formulas" | "questions";

interface Entry {
  kind: Kind;
  subject_id: string | null;
  chapter_id: string | null;
  exams: string[];
}

const VAULTS: { id: Kind; label: string; blurb: string; Icon: (typeof Icons)[keyof typeof Icons]; noun: string }[] = [
  { id: "notes", label: "PDF Notes", blurb: "Chapter notes to read and revise", Icon: Icons.book, noun: "note" },
  { id: "flashcards", label: "Flashcards", blurb: "Quick-recall pictures by chapter", Icon: Icons.component, noun: "card" },
  { id: "formulas", label: "Formulas", blurb: "Formula sheets and key facts", Icon: Icons.sigma, noun: "formula sheet" },
  { id: "questions", label: "Questions PDF", blurb: "Practice sets and papers", Icon: Icons.clipboardCheck, noun: "question set" },
];

const LOOSE = "loose";

/** "2 notes, 1 card" for one chapter, or "Empty". */
function chapterSummary(entries: readonly Entry[]): string {
  const parts = VAULTS.map((v) => ({ v, n: entries.filter((e) => e.kind === v.id).length })).filter((x) => x.n > 0);
  return parts.length === 0 ? "Empty" : parts.map((x) => plural(x.n, x.v.noun)).join(", ");
}

/**
 * The home page "Free Study Material" area. The three exam folders and the four vaults are always shown, filled or not.
 * An exam folder opens to its subject folders, and a subject opens to its chapters as a list.
 */
export function StudyFolders() {
  const taxonomy = useTaxonomy();
  const [entries, setEntries] = React.useState<Entry[] | null>(null);
  const [examId, setExamId] = React.useState<string | null>(null);
  const [subjectId, setSubjectId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("resources").select("vault, subject_id, chapter_id, exams"),
      supabase.from("flashcard_images").select("subject_id, chapter_id, exams"),
    ]).then(([res, pics]) => {
      if (!active) return;
      const files = res.error ? [] : ((res.data ?? []) as { vault: Kind; subject_id: string | null; chapter_id: string | null; exams: string[] | null }[]);
      const cards = pics.error ? [] : ((pics.data ?? []) as { subject_id: string | null; chapter_id: string | null; exams: string[] | null }[]);
      setEntries([
        ...files.filter((f) => f.subject_id).map((f) => ({ kind: f.vault, subject_id: f.subject_id, chapter_id: f.chapter_id, exams: f.exams ?? [] })),
        ...cards.map((c) => ({ kind: "flashcards" as const, subject_id: c.subject_id, chapter_id: c.chapter_id, exams: c.exams ?? [] })),
      ]);
    });
    return () => {
      active = false;
    };
  }, []);

  const open = React.useCallback((exam: string | null, subject: string | null = null) => {
    setExamId(exam);
    setSubjectId(subject);
  }, []);

  if (entries === null || taxonomy.loading) {
    return (
      <SkeletonGroup label="Loading study material" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-panel" />
        ))}
      </SkeletonGroup>
    );
  }

  const exam = EXAMS.find((e) => e.id === examId);

  // Inside an exam folder.
  if (exam) {
    const inExam = entries.filter((e) => itemInExam(e.exams, exam.id));
    const folders = buildFolders(inExam, taxonomy.subjects, taxonomy.chapters).filter(
      (f) => (f.count > 0 || f.subject.name !== "Unsorted") && subjectInExam(f.subject, entries, exam.id),
    );
    const folder = subjectId ? folders.find((f) => f.subject.id === subjectId) : undefined;

    // A subject: its chapters as a list.
    if (folder) {
      const subjectEntries = inExam.filter((e) => e.subject_id === folder.subject.id);
      const chapterIds = new Set(folder.chapters.map((c) => c.id));
      const loose = subjectEntries.filter((e) => !e.chapter_id || !chapterIds.has(e.chapter_id));
      const rows = [
        ...(loose.length > 0 ? [{ id: LOOSE, name: "General", entries: loose }] : []),
        ...sortChapters(taxonomy.chapters.filter((c) => c.subject_id === folder.subject.id)).map((c) => ({
          id: c.id,
          name: c.name,
          entries: subjectEntries.filter((e) => e.chapter_id === c.id),
        })),
      ];
      return (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton label={exam.name} onClick={() => open(exam.id)} />
            <h3 className="text-xl font-bold tracking-tight text-white">
              {exam.name} <span className="text-steel-500">/</span> {folder.subject.name}
            </h3>
          </div>
          {rows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-lg font-bold text-white">No chapters yet</p>
                <p className="mt-2 text-sm text-steel-300">Chapters for {folder.subject.name} will appear here once they are added.</p>
              </CardContent>
            </Card>
          ) : (
            <ul className="list-none divide-y divide-steel-700/60 overflow-hidden rounded-panel border border-steel-700/60 bg-navy-900 p-0">
              {rows.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3">
                  <span className="min-w-0 truncate text-sm font-semibold text-white">{row.name}</span>
                  <span className="font-mono text-xs text-steel-300">{chapterSummary(row.entries)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            {VAULTS.map((v) => (
              <Link
                key={v.id}
                href={`/study-material?vault=${v.id}&exam=${exam.id}`}
                className="inline-flex items-center gap-2 rounded-control border border-steel-700 bg-navy-900 px-3 py-2 text-xs font-semibold text-steel-100 transition-colors hover:border-gold-400 hover:text-gold-300"
              >
                <v.Icon className="size-4" aria-hidden />
                Open {v.label}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    // An exam: its subject folders.
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <BackButton label="All folders" onClick={() => open(null)} />
          <h3 className="text-xl font-bold tracking-tight text-white">{exam.name}</h3>
        </div>
        {folders.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-lg font-bold text-white">No subjects yet</p>
              <p className="mt-2 text-sm text-steel-300">Subjects for {exam.name} will appear here once they are added.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {folders.map((f) => (
              <SubjectFolderCard key={f.subject.id} folder={f} unit="item" onOpen={() => open(exam.id, f.subject.id)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // The top: three exam folders and four vaults, always shown.
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-white">By exam</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {EXAMS.map((e) => {
            const subjects = taxonomy.subjects.filter((s) => s.name !== "Unsorted" && subjectInExam(s, entries, e.id)).length;
            const total = entries.filter((x) => itemInExam(x.exams, e.id)).length;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => open(e.id)}
                className="group flex items-center gap-4 rounded-panel border border-steel-700/60 bg-navy-900 p-5 text-left transition-colors hover:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
              >
                <Icons.shield className="size-8 shrink-0 text-gold-400" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-lg font-bold text-white group-hover:text-gold-300">{e.name}</span>
                  <span className="block font-mono text-xs text-steel-300">{total === 0 ? "Empty" : `${plural(subjects, "subject")}, ${plural(total, "item")}`}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-white">Vaults</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VAULTS.map(({ id, label, blurb, Icon, noun }) => {
            const count = entries.filter((x) => x.kind === id).length;
            return (
              <Link
                key={id}
                href={`/study-material?vault=${id}`}
                className="group flex flex-col gap-3 rounded-panel border border-steel-700/60 bg-navy-900 p-5 transition-colors hover:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
              >
                <Icon className="size-8 text-gold-400" aria-hidden />
                <div>
                  <p className="text-lg font-bold text-white group-hover:text-gold-300">{label}</p>
                  <p className="mt-1 text-xs text-steel-300">{blurb}</p>
                </div>
                <p className="font-mono text-xs text-steel-300">{count === 0 ? "Empty" : plural(count, noun)}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
