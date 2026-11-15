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
import { logAdminAction } from "@/lib/adminLog";
import { MOCK_COLUMNS, type MockTestRow } from "@/lib/mockTests";
import { supabase } from "@/lib/supabaseClient";

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-bold text-white">{value}</dd>
    </div>
  );
}

export default function AdminMockTestsPage() {
  const [tests, setTests] = React.useState<MockTestRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [notice, setNotice] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("mock_tests")
      .select(MOCK_COLUMNS)
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
  }, [version]);

  const remove = async (test: MockTestRow) => {
    setNotice(null);
    setBusyId(test.id);
    const { data, error: deleteError } = await supabase.from("mock_tests").delete().eq("id", test.id).select("id");
    setBusyId(null);

    if (deleteError || !data?.length) {
      setNotice({ type: "error", text: `The mock test was not deleted: ${deleteError?.message ?? "you may not have permission"}.` });
      return;
    }

    await logAdminAction({
      action: "deleted",
      entityType: "mock_test",
      label: test.title,
      details: {
        mock_test_id: test.id,
        code: test.code,
        exam: test.target_exam,
        questions: test.total_questions,
        was_published: test.is_published,
      },
    });
    setNotice({ type: "success", text: `"${test.title}" was deleted. The questions themselves are still in the bank.` });
    setVersion((v) => v + 1);
  };

  const empty = tests !== null && tests.length === 0 && !error;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="gold" className="mb-2">Test Center</Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Mock Tests</h1>
          <p className="mt-1 text-sm text-steel-300">
            Timed papers built from the question bank. Published tests appear on the cadet Test Center.
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/mock-tests/new">
            <Icons.plus className="size-4" />
            Create New Mock Test
          </Link>
        </Button>
      </div>

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

      {error ? <p role="alert" className="text-xs text-danger-400">Could not load mock tests: {error}</p> : null}

      {tests === null && !error ? (
        <SkeletonGroup label="Loading mock tests" className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-panel" />
          ))}
        </SkeletonGroup>
      ) : null}

      {empty ? (
        <Card>
          <CardContent className="space-y-5 py-16 text-center">
            <p className="text-2xl font-bold text-white">No mock tests yet</p>
            <p className="mx-auto max-w-md text-sm text-steel-300">
              Create a test, attach questions from the bank, and publish it for cadets.
            </p>
            <Button asChild variant="primary" size="lg">
              <Link href="/admin/mock-tests/new">
                <Icons.plus className="size-4" />
                Create your first mock test
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tests && tests.length > 0 ? (
        <ul className="space-y-4">
          {tests.map((test) => (
            <li key={test.id}>
              <Card>
                <CardContent className="space-y-4 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{test.code}</span>
                        <Badge variant="gold">{test.target_exam}</Badge>
                        <Badge variant={test.is_published ? "emerald" : "neutral"}>{test.is_published ? "Published" : "Draft"}</Badge>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-white">{test.title}</h2>
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
                            <AlertDialogTitle>Delete this mock test?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{test.title}&quot; disappears from the cadet Test Center. The questions stay in the bank. The action is
                              saved in the audit log.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep it</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void remove(test)}>Delete mock test</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <dl className="grid grid-cols-3 gap-3 rounded-control border border-steel-700/60 bg-navy-950 p-3 sm:max-w-md">
                    <Fact label="Duration" value={`${test.duration_minutes}m`} />
                    <Fact label="Questions" value={test.total_questions} />
                    <Fact label="Marks" value={test.total_marks} />
                  </dl>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
