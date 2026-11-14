"use client";

import * as React from "react";
import Link from "next/link";
import { EditQuestionDialog } from "@/components/admin/questions/edit-question-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BANK_COLUMNS, BANK_PAGE_SIZE, type BankModule, type BankQuestion } from "@/lib/questionBank";
import { supabase } from "@/lib/supabaseClient";

/** Escapes the characters that act as wildcards in an ilike search. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

export default function AdminQuestionsPage() {
  const [modules, setModules] = React.useState<BankModule[]>([]);
  const [moduleId, setModuleId] = React.useState("all");
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [version, setVersion] = React.useState(0);

  const [rows, setRows] = React.useState<BankQuestion[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const [editing, setEditing] = React.useState<BankQuestion | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  // The module list for the filter and for naming each row.
  React.useEffect(() => {
    let active = true;
    supabase
      .from("quizzes")
      .select("id, title, category")
      .order("title", { ascending: true })
      .then(({ data }) => {
        if (active) setModules((data ?? []) as BankModule[]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Wait a moment after typing before searching.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    let active = true;
    let query = supabase.from("questions").select(BANK_COLUMNS, { count: "exact" });
    if (moduleId !== "all") query = query.eq("quiz_id", moduleId);
    if (search) query = query.ilike("question_text", `%${escapeLike(search)}%`);
    query =
      moduleId === "all"
        ? query.order("created_at", { ascending: false })
        : query.order("position", { ascending: true });
    query
      .range(page * BANK_PAGE_SIZE, page * BANK_PAGE_SIZE + BANK_PAGE_SIZE - 1)
      .then(({ data, count, error: queryError }) => {
        if (!active) return;
        if (queryError) {
          setError(queryError.message);
          return;
        }
        setError(null);
        setRows((data ?? []) as BankQuestion[]);
        setTotal(count ?? 0);
      });
    return () => {
      active = false;
    };
  }, [moduleId, search, page, version]);

  const moduleTitle = React.useCallback(
    (quizId: string) => modules.find((m) => m.id === quizId)?.title ?? "Unknown module",
    [modules],
  );

  const pageCount = Math.max(1, Math.ceil(total / BANK_PAGE_SIZE));
  const from = total === 0 ? 0 : page * BANK_PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * BANK_PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="gold" className="mb-2">Content Management</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white">Question Bank</h1>
          <p className="mt-1 text-sm text-steel-300">
            Every question in every module. Pick Edit to fix wording, options, the answer or the solution.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/seed">Add questions</Link>
        </Button>
      </div>

      {notice ? (
        <p role="status" className="rounded-control border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs font-semibold text-emerald-300">
          {notice}
        </p>
      ) : null}

      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-lg">All Questions</CardTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="bank-search" className="sr-only">Search question text</label>
              <Input
                id="bank-search"
                type="search"
                placeholder="Search question text..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="bank-module" className="sr-only">Filter by module</label>
              <Select
                id="bank-module"
                value={moduleId}
                onChange={(e) => {
                  setModuleId(e.target.value);
                  setPage(0);
                }}
              >
                <option value="all">All modules</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error ? <p role="alert" className="text-xs text-danger-400">Could not load questions: {error}</p> : null}
          {!rows && !error ? <p className="text-xs text-steel-300">Loading questions...</p> : null}
          {rows && rows.length === 0 ? (
            <p className="text-xs text-steel-300">
              {search || moduleId !== "all" ? "No questions match these filters." : "No questions yet."}
            </p>
          ) : null}

          {rows && rows.length > 0 ? (
            <>
              <ul className="divide-y divide-steel-700/40">
                {rows.map((q) => (
                  <li key={q.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="neutral">#{q.position ?? "?"}</Badge>
                        <Badge variant="outline">{moduleTitle(q.quiz_id)}</Badge>
                        <Badge variant="emerald">Answer {q.correct_option}</Badge>
                      </div>
                      <p className="line-clamp-2 text-sm text-steel-100">{q.question_text}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        setNotice(null);
                        setEditing(q);
                      }}
                      aria-label={`Edit question ${q.position ?? ""} in ${moduleTitle(q.quiz_id)}`}
                    >
                      Edit
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-steel-700/60 pt-4">
                <p role="status" className="text-xs tabular-nums text-steel-300">
                  Showing {from}-{to} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="text-xs tabular-nums text-steel-300">
                    Page {page + 1} of {pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <EditQuestionDialog
        question={editing}
        moduleTitle={editing ? moduleTitle(editing.quiz_id) : ""}
        onClose={() => setEditing(null)}
        onSaved={(message) => {
          setEditing(null);
          setNotice(message);
          setVersion((v) => v + 1);
        }}
      />
    </div>
  );
}
