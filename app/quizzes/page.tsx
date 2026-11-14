"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
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

export default function QuizzesPage() {
  const [mocks, setMocks] = React.useState<MockTest[] | null>(null);
  const [modules, setModules] = React.useState<PracticeModule[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      supabase
        .from("mock_tests")
        .select("id, title, code, target_exam, total_questions, duration_minutes, total_marks, passing_marks")
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
          <div className="flex items-center gap-3">
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
          <section aria-labelledby="mock-heading" className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 id="mock-heading" className="text-xl font-bold text-white">Mock Tests</h2>
              <Badge variant="outline">{mocks.length}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {mocks.map((test) => (
                <Card key={test.id} className="flex flex-col justify-between">
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
                      <Stat label="Marks" value={test.total_marks} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-steel-300">Pass mark: {test.passing_marks}</span>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/exams/${test.target_exam.toLowerCase()}`}>
                          View exam details<span className="sr-only"> for {test.title}</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
