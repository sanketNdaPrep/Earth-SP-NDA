"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { logAdminAction } from "@/lib/adminLog";
import { KIND_LABEL, MOCK_COLUMNS, type MockTestRow } from "@/lib/mockTests";
import { supabase } from "@/lib/supabaseClient";
import { groupBySubject } from "@/lib/taxonomy";
import { cutoffText, KIND_SHORT, type TestKind } from "@/lib/test-settings";

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-bold text-white">{value}</dd>
    </div>
  );
}

const EMPTY: Record<TestKind, string> = {
  mock: "No full mock tests yet.",
  subject: "No subject-wise tests yet.",
  chapter: "No chapter-wise tests yet.",
};

/** Every test of one kind, as cards. Subject-wise and chapter-wise tests sit in subject (and chapter) folders. */
export function TestList({ kind }: { kind: TestKind }) {
  const [tests, setTests] = React.useState<MockTestRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [notice, setNotice] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const taxonomy = useTaxonomy();

  React.useEffect(() => {
    let active = true;
    supabase
      .from("mock_tests")
      .select(MOCK_COLUMNS)
      .eq("kind", kind)
      .order("created_at", { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) {
          setError(queryError.message);
          setTests((prev) => prev ?? []);
          return;
        }
        setError(null);
        setTests((data ?? []) as MockTestRow[]);
      });
    return () => {
      active = false;
    };
  }, [kind, version]);

  const remove = async (test: MockTestRow) => {
    setNotice(null);
    setBusyId(test.id);
    const { data, error: deleteError } = await supabase.from("mock_tests").delete().eq("id", test.id).select("id");
    setBusyId(null);
    if (deleteError || !data?.length) {
      setNotice({ type: "error", text: `The test was not deleted: ${deleteError?.message ?? "you may not have permission"}.` });
      return;
    }
    // The test's own questions are deleted with it by the database. Shared bank questions stay.
    if (test.source_pdf) await supabase.storage.from("study-materials").remove([test.source_pdf]);
    await logAdminAction({
      action: "deleted",
      entityType: "mock_test",
      label: test.title,
      details: { mock_test_id: test.id, code: test.code, exam: test.target_exam, kind: test.kind, questions: test.total_questions, was_published: test.is_published },
    });
    setNotice({ type: "success", text: `"${test.title}" was deleted with its questions.` });
    setVersion((v) => v + 1);
  };

  const card = (test: MockTestRow) => {
    const cutoff = cutoffText(test.cutoff_min === null ? null : Number(test.cutoff_min), test.cutoff_max === null ? null : Number(test.cutoff_max));
    const minus = Number(test.negative_marks);
    return (
      <li key={test.id}>
        <Card>
          <CardContent className="space-y-4 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{test.code}</span>
                  <Badge variant="gold">{test.target_exam}</Badge>
                  <Badge variant="outline">{KIND_SHORT[test.kind] ?? KIND_LABEL.mock}</Badge>
                  <Badge variant={test.is_published ? "emerald" : "neutral"}>{test.is_published ? "Published" : "Draft"}</Badge>
                  {test.source_pdf ? <Badge variant="outline">PDF saved</Badge> : null}
                </div>
                <h3 className="mt-2 text-xl font-bold text-white">{test.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/mock-tests/${test.id}/edit`}>
                    Edit<span className="sr-only"> {test.title}</span>
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={busyId === test.id} aria-label={`Delete ${test.title}`}>
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent tone="danger">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this test?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{test.title}&quot; disappears from the cadet Test Center, together with the questions you added to it. Questions
                        from the shared bank stay. Students&apos; past results are kept. The action is saved in the audit log.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void remove(test)}>Delete test</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-3 rounded-control border border-steel-700/60 bg-navy-950 p-3 sm:grid-cols-5 sm:max-w-2xl">
              <Fact label="Questions" value={test.total_questions} />
              <Fact label="Time" value={`${test.duration_minutes}m`} />
              <Fact label="Marks" value={Number(test.total_marks)} />
              <Fact label="Right / wrong" value={`+${Number(test.marks_per_correct)} / ${minus > 0 ? `-${minus}` : "0"}`} />
              <Fact label="Cutoff" value={cutoff ?? "None"} />
            </dl>
          </CardContent>
        </Card>
      </li>
    );
  };

  const sections = React.useMemo(
    () => (tests && kind !== "mock" ? groupBySubject(tests, taxonomy.subjects, taxonomy.chapters) : []),
    [tests, kind, taxonomy.subjects, taxonomy.chapters],
  );
  const empty = tests !== null && tests.length === 0 && !error;

  return (
    <div className="space-y-6">
      {notice ? (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={
            notice.type === "error"
              ? "rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400"
              : "rounded-control border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs font-semibold text-emerald-300"
          }
        >
          {notice.text}
        </p>
      ) : null}
      {error ? <p role="alert" className="text-xs text-danger-400">Could not load tests: {error}</p> : null}
      {tests === null && !error ? (
        <SkeletonGroup label="Loading tests" className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-panel" />
          ))}
        </SkeletonGroup>
      ) : null}
      {empty ? (
        <Card>
          <CardContent className="space-y-5 py-14 text-center">
            <p className="text-2xl font-bold text-white">{EMPTY[kind]}</p>
            <p className="mx-auto max-w-md text-sm text-steel-300">Add one by typing the questions or uploading a PDF. Students see it once you publish it.</p>
            <Button asChild variant="primary" size="lg">
              <Link href={`/admin/mock-tests/new?kind=${kind}`}>
                <Icons.plus className="size-4" />
                Add the first one
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      {tests && tests.length > 0 && kind === "mock" ? <ul className="space-y-4">{tests.map(card)}</ul> : null}
      {tests && tests.length > 0 && kind !== "mock"
        ? sections.map((section) => (
            <section key={section.key} aria-labelledby={`sec-${section.key}`} className="space-y-4">
              <h2 id={`sec-${section.key}`} className="flex items-center gap-2 border-b border-steel-700/60 pb-2 text-lg font-bold text-white">
                <Icons.book className="size-5 text-gold-300" aria-hidden />
                {section.subjectName}
              </h2>
              {section.chapters.map((group) => (
                <div key={group.key} className="space-y-3">
                  {group.chapterName ? <h3 className="pl-1 text-sm font-semibold uppercase tracking-wider text-steel-300">{group.chapterName}</h3> : null}
                  <ul className="space-y-4">{group.items.map(card)}</ul>
                </div>
              ))}
            </section>
          ))
        : null}
    </div>
  );
}
