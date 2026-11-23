"use client";

import * as React from "react";
import Link from "next/link";
import { OPTS, TAXONOMY } from "@/components/admin/seed/data";
import { MathText } from "@/components/quiz/math-text";
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { TestList } from "@/components/admin/mock-tests/test-list";
import { KIND_LABEL, TEST_KINDS, type TestKind } from "@/lib/test-settings";
import { logAdminAction } from "@/lib/adminLog";
import {
  BANK_COLUMNS,
  BANK_PAGE_SIZE,
  clip,
  isMissingTopicColumn,
  optionText,
  toBankQuestion,
  type BankModule,
  type BankQuestion,
} from "@/lib/questionBank";
import { supabase } from "@/lib/supabaseClient";

type ListQuestion = BankQuestion & { topic?: string | null };

/** Escapes the characters that act as wildcards in an ilike search. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

function QuestionCardView({
  question,
  moduleName,
  busy,
  onDelete,
}: {
  question: ListQuestion;
  moduleName: string;
  busy: boolean;
  onDelete: (q: ListQuestion) => void;
}) {
  const label = `question ${question.position ?? ""} in ${moduleName}`.replace(/\s+/g, " ");
  const steps = (question.explanation ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  return (
    <Card>
      <CardContent className="space-y-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">Q{question.position ?? "?"}</Badge>
            <Badge variant="outline">{moduleName}</Badge>
            {question.topic ? <Badge variant="gold">{question.topic}</Badge> : null}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/questions/${question.id}/edit`}>
                Edit<span className="sr-only"> {label}</span>
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={busy} aria-label={`Delete ${label}`}>
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent tone="danger">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &quot;{clip(question.question_text, 90)}&quot; is removed from {moduleName} for good, and so are
                    cadets&apos; saved answers to it. The action is saved in the audit log.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(question)}>Delete question</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-lg leading-relaxed text-white">
          <MathText text={question.question_text} />
        </p>

        <ul className="space-y-2" aria-label="Answer options">
          {OPTS.map((opt) => {
            const isCorrect = question.correct_option === opt;
            return (
              <li
                key={opt}
                className={
                  isCorrect
                    ? "flex items-center gap-3 rounded-control border border-emerald-400 bg-emerald-400/10 p-3"
                    : "flex items-center gap-3 rounded-control border border-steel-700 bg-navy-950 p-3"
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    isCorrect
                      ? "flex size-7 shrink-0 items-center justify-center rounded-full border border-emerald-400 bg-emerald-400 font-mono text-xs font-bold text-navy-950"
                      : "flex size-7 shrink-0 items-center justify-center rounded-full border border-steel-700 font-mono text-xs font-bold text-steel-300"
                  }
                >
                  {opt}
                </span>
                <span className="min-w-0 flex-1 text-sm text-steel-100">
                  <MathText text={optionText(question, opt)} />
                </span>
                {isCorrect ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-300">
                    <Icons.checkCircle className="size-4" />
                    Correct answer
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>

        {steps.length > 0 ? (
          <details className="rounded-control border border-steel-700/60 bg-navy-950 p-3 text-sm text-steel-300">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-gold-300">Solution</summary>
            <div className="mt-2 space-y-1">
              {steps.map((line, i) => (
                <p key={i}>
                  <MathText text={line} />
                </p>
              ))}
            </div>
          </details>
        ) : (
          <p className="text-xs text-steel-500">No solution added yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

/** The old one-question-at-a-time bank: questions that belong to practice modules. */
function PracticeBank() {
  const [modules, setModules] = React.useState<BankModule[]>([]);
  const [topicSupported, setTopicSupported] = React.useState<boolean | null>(null);
  const [moduleId, setModuleId] = React.useState("all");
  const [topicFilter, setTopicFilter] = React.useState("all");
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [version, setVersion] = React.useState(0);

  const [rows, setRows] = React.useState<ListQuestion[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const [notice, setNotice] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // The module list (for the filter and for naming each card), and whether topics can be read.
  React.useEffect(() => {
    let active = true;
    (async () => {
      const [moduleResult, probe] = await Promise.all([
        supabase.from("quizzes").select("id, title, category").order("title", { ascending: true }),
        supabase.from("questions").select("topic").limit(1),
      ]);
      if (!active) return;
      setModules((moduleResult.data ?? []) as BankModule[]);
      setTopicSupported(!isMissingTopicColumn(probe.error));
    })();
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
    if (topicSupported === null) return;
    let active = true;
    const columns = topicSupported ? `${BANK_COLUMNS}, topic` : BANK_COLUMNS;
    let query = supabase.from("questions").select(columns, { count: "exact" }).is("mock_test_id", null);
    if (moduleId !== "all") query = query.eq("quiz_id", moduleId);
    if (topicSupported && topicFilter !== "all") query = query.eq("topic", topicFilter);
    if (search) query = query.ilike("question_text", `%${escapeLike(search)}%`);
    query = moduleId === "all" ? query.order("created_at", { ascending: false }) : query.order("position", { ascending: true });
    query.range(page * BANK_PAGE_SIZE, page * BANK_PAGE_SIZE + BANK_PAGE_SIZE - 1).then(({ data, count, error: queryError }) => {
      if (!active) return;
      if (queryError) {
        setError(queryError.message);
        setRows((prev) => prev ?? []);
        return;
      }
      setError(null);
      setRows(((data ?? []) as unknown as Record<string, unknown>[]).map((row) => toBankQuestion(row)) as unknown as ListQuestion[]);
      setTotal(count ?? 0);
    });
    return () => {
      active = false;
    };
  }, [moduleId, topicFilter, search, page, version, topicSupported]);

  const moduleTitle = React.useCallback(
    (quizId: string) => modules.find((m) => m.id === quizId)?.title ?? "Unknown module",
    [modules],
  );

  const remove = async (question: ListQuestion) => {
    setNotice(null);
    setBusyId(question.id);
    const name = moduleTitle(question.quiz_id);
    const { data, error: deleteError } = await supabase.from("questions").delete().eq("id", question.id).select("id");
    setBusyId(null);

    if (deleteError || !data?.length) {
      setNotice({ type: "error", text: `The question was not deleted: ${deleteError?.message ?? "you may not have permission"}.` });
      return;
    }

    await logAdminAction({
      action: "deleted",
      entityType: "question",
      label: `Question #${question.position ?? "?"} in ${name}`,
      details: {
        quiz_id: question.quiz_id,
        question_id: question.id,
        position: question.position,
        topic: question.topic ?? null,
        question_text: clip(question.question_text),
      },
    });

    setNotice({ type: "success", text: `Question #${question.position ?? "?"} in ${name} was deleted.` });
    // Step back a page if that was the last card on it.
    if (rows && rows.length === 1 && page > 0) setPage((p) => p - 1);
    setVersion((v) => v + 1);
  };

  const filtering = Boolean(search) || moduleId !== "all" || topicFilter !== "all";
  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setModuleId("all");
    setTopicFilter("all");
    setPage(0);
  };

  const pageCount = Math.max(1, Math.ceil(total / BANK_PAGE_SIZE));
  const from = total === 0 ? 0 : page * BANK_PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * BANK_PAGE_SIZE);
  const bankIsEmpty = rows !== null && !error && rows.length === 0 && !filtering;

  return (
    <div className="space-y-8">
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

      {!bankIsEmpty ? (
        <div className={topicSupported ? "grid grid-cols-1 gap-3 md:grid-cols-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
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
                  [{m.category}] {m.title}
                </option>
              ))}
            </Select>
          </div>
          {topicSupported ? (
            <div>
              <label htmlFor="bank-topic" className="sr-only">Filter by subject or topic</label>
              <Select
                id="bank-topic"
                value={topicFilter}
                onChange={(e) => {
                  setTopicFilter(e.target.value);
                  setPage(0);
                }}
              >
                <option value="all">All subjects / topics</option>
                {Object.entries(TAXONOMY).map(([group, topics]) => (
                  <optgroup key={group} label={group}>
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p role="alert" className="text-xs text-danger-400">Could not load questions: {error}</p> : null}

      {rows === null && !error ? (
        <SkeletonGroup label="Loading questions" className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-panel" />
          ))}
        </SkeletonGroup>
      ) : null}

      {bankIsEmpty ? (
        <Card>
          <CardContent className="space-y-5 py-16 text-center">
            <p className="text-2xl font-bold text-white">No questions yet</p>
            <p className="mx-auto max-w-md text-sm text-steel-300">
              Your question bank is empty. Add the first question and it appears here, ready for cadets to practise.
            </p>
            <Button asChild variant="primary" size="lg">
              <Link href="/admin/questions/new">
                <Icons.plus className="size-4" />
                Create your first question
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {rows && rows.length === 0 && filtering && !error ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-lg font-bold text-white">No questions match these filters</p>
            <p className="text-sm text-steel-300">Try a shorter search or a different module or topic.</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {rows && rows.length > 0 ? (
        <>
          <div className="space-y-4">
            {rows.map((q) => (
              <QuestionCardView key={q.id} question={q} moduleName={moduleTitle(q.quiz_id)} busy={busyId === q.id} onDelete={remove} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-steel-700/60 pt-4">
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
              <Button variant="outline" size="sm" disabled={page + 1 >= pageCount} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

type BankTab = TestKind | "practice";

const TAB_NOTE: Record<BankTab, string> = {
  mock: "Full-length papers for NDA, CDS or AFCAT. Timed, with negative marking and a cutoff.",
  subject: "Tests on one subject, kept in a folder for each subject.",
  chapter: "Short tests on one chapter, kept in subject and chapter folders.",
  practice: "Single questions in practice modules, the way the bank worked before.",
};

export default function AdminQuestionsPage() {
  const [tab, setTab] = React.useState<BankTab>("mock");
  const tabs: { id: BankTab; label: string }[] = [...TEST_KINDS.map((k) => ({ id: k as BankTab, label: KIND_LABEL[k] })), { id: "practice", label: "Practice modules" }];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="gold" className="mb-2">Question Seeding Portal</Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Question Bank</h1>
          <p className="mt-1 text-sm text-steel-300">{TAB_NOTE[tab]}</p>
        </div>
        <Button asChild variant="primary">
          <Link href={tab === "practice" ? "/admin/questions/new" : `/admin/mock-tests/new?kind=${tab}`}>
            <Icons.plus className="size-4" />
            {tab === "practice" ? "Add Questions" : "Add a Test"}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Question bank sections">
        {tabs.map((t) => (
          <Button key={t.id} type="button" role="tab" id={`bank-tab-${t.id}`} aria-selected={tab === t.id} aria-controls="bank-panel" size="sm" variant={tab === t.id ? "primary" : "outline"} onClick={() => setTab(t.id)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div id="bank-panel" role="tabpanel" aria-labelledby={`bank-tab-${tab}`}>
        {tab === "practice" ? <PracticeBank /> : <TestList key={tab} kind={tab} />}
      </div>
    </div>
  );
}
