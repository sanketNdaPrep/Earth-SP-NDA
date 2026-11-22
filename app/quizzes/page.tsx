"use client";

import * as React from "react";
import Link from "next/link";
import { AdminShortcut } from "@/components/landing/admin-shortcut";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { cutoffText, KIND_SHORT, TEST_KINDS, type TestKind } from "@/lib/test-settings";
import { supabase } from "@/lib/supabaseClient";

interface MockTest {
  id: string;
  title: string;
  code: string;
  target_exam: string;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  kind: TestKind;
  subject_id: string | null;
  chapter_id: string | null;
  marks_per_correct: number;
  negative_marks: number;
  cutoff_min: number | null;
  cutoff_max: number | null;
}

interface PracticeModule {
  id: string;
  title: string;
  description: string | null;
  category: string;
  time_limit_mins: number;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-steel-500">{label}</div>
      <div className="mt-1 font-mono text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <SkeletonGroup label="Loading tests" className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-48 w-full rounded-panel" />
      ))}
    </SkeletonGroup>
  );
}

const EMPTY_TEXT: Record<TestKind, string> = {
  mock: "No full mock tests are published yet.",
  subject: "No subject-wise tests are published yet.",
  chapter: "No chapter-wise tests are published yet.",
};

/** One test on the Test Center: what it is, how it is marked, and the Start button. */
function TestCard({ test }: { test: MockTest }) {
  const plus = Number(test.marks_per_correct);
  const minus = Number(test.negative_marks);
  const cutoff = cutoffText(test.cutoff_min === null ? null : Number(test.cutoff_min), test.cutoff_max === null ? null : Number(test.cutoff_max));
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{test.code}</span>
          <Badge variant="gold">{test.target_exam}</Badge>
        </div>
        <CardTitle className="mt-2 text-xl">{test.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-2 rounded-control border border-steel-700/60 bg-navy-950 p-3 text-center">
          <Stat label="Questions" value={test.total_questions} />
          <Stat label="Time" value={`${test.duration_minutes}m`} />
          <Stat label="Marks" value={Number(test.total_marks)} />
        </div>
        <ul className="space-y-1 text-xs text-steel-300">
          <li>
            Right answer <span className="font-mono font-semibold text-emerald-300">+{plus}</span>, wrong answer{" "}
            {minus > 0 ? <span className="font-mono font-semibold text-gold-300">-{minus}</span> : <span className="font-semibold text-steel-100">no penalty</span>}
          </li>
          {cutoff ? (
            <li>
              Expected cutoff <span className="font-mono font-semibold text-white">{cutoff}</span>
            </li>
          ) : null}
        </ul>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-steel-700/60 pt-4">
          {test.kind === "mock" ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/exams/${test.target_exam.toLowerCase()}`}>
                Details<span className="sr-only"> for {test.title}</span>
              </Link>
            </Button>
          ) : null}
          {test.total_questions > 0 ? (
            <Button asChild variant="primary" size="sm">
              <Link href={`/quizzes/${test.id}`}>
                Start Test<span className="sr-only">: {test.title}</span>
              </Link>
            </Button>
          ) : (
            <Badge variant="outline">Questions coming soon</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function QuizzesPage() {
  const [mocks, setMocks] = React.useState<MockTest[] | null>(null);
  const [modules, setModules] = React.useState<PracticeModule[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<TestKind>("mock");
  const [subjectFilter, setSubjectFilter] = React.useState<string | null>(null);
  const taxonomy = useTaxonomy();

  React.useEffect(() => {
    let active = true;
    Promise.all([
      supabase
        .from("mock_tests")
        .select("id, title, code, target_exam, total_questions, duration_minutes, total_marks, passing_marks, kind, subject_id, chapter_id, marks_per_correct, negative_marks, cutoff_min, cutoff_max")
        .eq("is_published", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("quizzes")
        .select("id, title, description, category, time_limit_mins")
        .order("created_at", { ascending: false }),
    ]).then(([mockResult, moduleResult]) => {
      if (!active) return;
      const failure = mockResult.error ?? moduleResult.error;
      if (failure) setError(failure.message);
      setMocks((mockResult.data ?? []) as MockTest[]);
      setModules((moduleResult.data ?? []) as PracticeModule[]);
    });
    return () => {
      active = false;
    };
  }, []);

  const loading = mocks === null || modules === null;
  const nothingAtAll = !loading && mocks.length === 0 && modules.length === 0;

  return (
    <div className="min-h-screen bg-navy-950 p-6 text-steel-100 md:p-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="flex flex-col gap-4 border-b border-steel-700/60 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="gold">Test Center</Badge>
            <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white">Examination Modules</h1>
            <p className="mt-1 text-sm text-steel-300">Select a test to measure your preparation.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AdminShortcut href="/admin/mock-tests" label="Manage tests" />
            <Button asChild variant="primary" size="sm">
              <Link href="/dashboard">Cadet Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </header>

        {error ? (
          <p role="alert" className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400">
            Some tests could not be loaded: {error}
          </p>
        ) : null}

        {loading ? <ListSkeleton /> : null}

        {nothingAtAll ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-bold text-white">No tests are available yet</p>
              <p className="mt-2 text-sm text-steel-300">New mock tests and practice modules appear here as soon as they are published. Check back soon.</p>
            </CardContent>
          </Card>
        ) : null}

        {!loading && mocks.length > 0 ? (
          <section aria-labelledby="mock-heading" className="space-y-5">
            <h2 id="mock-heading" className="sr-only">Tests</h2>
            <div role="group" aria-label="Kind of test" className="flex flex-wrap gap-2">
              {TEST_KINDS.map((k) => {
                const count = mocks.filter((t) => t.kind === k).length;
                return (
                  <Button key={k} size="sm" variant={tab === k ? "primary" : "outline"} aria-pressed={tab === k} onClick={() => { setTab(k); setSubjectFilter(null); }}>
                    {KIND_SHORT[k]}
                    <span className="font-mono text-xs opacity-80">{count}</span>
                  </Button>
                );
              })}
            </div>
            {(() => {
              const ofKind = mocks.filter((t) => t.kind === tab);
              const subjectIds = [...new Set(ofKind.map((t) => t.subject_id).filter((x): x is string => Boolean(x)))];
              const subjectName = (id: string | null) => taxonomy.subjects.find((x) => x.id === id)?.name ?? "Other subjects";
              const chapterName = (id: string | null) => taxonomy.chapters.find((x) => x.id === id)?.name ?? null;
              const shown = tab === "mock" || !subjectFilter ? ofKind : ofKind.filter((t) => t.subject_id === subjectFilter);
              if (ofKind.length === 0) {
                return (
                  <Card>
                    <CardContent className="py-10 text-center text-sm text-steel-300">{EMPTY_TEXT[tab]} Check back soon.</CardContent>
                  </Card>
                );
              }
              if (tab === "mock") {
                return (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {shown.map((t) => (
                      <TestCard key={t.id} test={t} />
                    ))}
                  </div>
                );
              }
              // Subject-wise and chapter-wise tests sit under their subject, and chapter-wise under the chapter too.
              const groups = [...new Set(shown.map((t) => t.subject_id))];
              return (
                <div className="space-y-8">
                  {subjectIds.length > 1 ? (
                    <div role="group" aria-label="Filter by subject" className="flex flex-wrap gap-2">
                      {[{ id: null as string | null, name: "All subjects" }, ...subjectIds.map((id) => ({ id: id as string | null, name: subjectName(id) }))].map((chip) => (
                        <Button key={chip.name} size="sm" variant={subjectFilter === chip.id ? "primary" : "outline"} aria-pressed={subjectFilter === chip.id} onClick={() => setSubjectFilter(chip.id)}>
                          {chip.name}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                  {groups.map((sid) => {
                    const inSubject = shown.filter((t) => t.subject_id === sid);
                    const chapterIds = tab === "chapter" ? [...new Set(inSubject.map((t) => t.chapter_id))] : [null];
                    return (
                      <div key={sid ?? "none"} className="space-y-5">
                        <h3 className="border-b border-steel-700/60 pb-2 text-lg font-bold text-white">{subjectName(sid)}</h3>
                        {chapterIds.map((cid) => {
                          const list = tab === "chapter" ? inSubject.filter((t) => t.chapter_id === cid) : inSubject;
                          return (
                            <div key={cid ?? "all"} className="space-y-3">
                              {tab === "chapter" ? <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{chapterName(cid) ?? "General"}</p> : null}
                              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {list.map((t) => (
                                  <TestCard key={t.id} test={t} />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </section>
        ) : null}

        {!loading && modules.length > 0 ? (
          <section aria-labelledby="module-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 id="module-heading" className="text-xl font-bold text-white">Practice Modules</h2>
              <Badge variant="outline">{modules.length}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {modules.map((quiz) => (
                <Card key={quiz.id} className="flex flex-col justify-between">
                  <CardHeader>
                    <Badge variant="emerald" className="w-fit">{quiz.category}</Badge>
                    <CardTitle className="mt-2 text-xl">{quiz.title}</CardTitle>
                    {quiz.description ? <p className="mt-1 text-sm text-steel-300">{quiz.description}</p> : null}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-3 border-t border-steel-700/60 pt-4">
                      <span className="font-mono text-xs text-steel-300">{quiz.time_limit_mins} mins</span>
                      <Button asChild variant="primary" size="sm">
                        <Link href={`/quiz/${quiz.id}`}>
                          Start Test<span className="sr-only">: {quiz.title}</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
