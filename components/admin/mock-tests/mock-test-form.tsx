"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { emptyFiling, FilingFields } from "@/components/admin/filing-fields";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { logAdminAction } from "@/lib/adminLog";
import { checkFiling, type FilingInput } from "@/lib/filing";
import { saveFiling } from "@/lib/filing-save";
import type { ExamId } from "@/lib/subjects";
import {
  checkMockTest,
  EXAMS,
  isMissingLinkTable,
  KIND_LABEL,
  MOCK_COLUMNS,
  MOCK_LIMITS,
  nextMockCode,
  TEST_KINDS,
  totalMarksOf,
  type TestKind,
  type AttachedQuestion,
  type Exam,
  type MockTestRow,
} from "@/lib/mockTests";
import { clip, type BankModule } from "@/lib/questionBank";
import { supabase } from "@/lib/supabaseClient";

type LoadState = "loading" | "ready" | "missing" | "error";
type Banner = { type: "success" | "error"; text: string };

interface SavedState {
  title: string;
  exam: Exam;
  duration: number;
  kind: TestKind;
  subjectId: string | null;
  chapterId: string | null;
  marksPerCorrect: number;
  negativeMarks: number;
  cutoffMin: number | null;
  cutoffMax: number | null;
  published: boolean;
  questionIds: string[];
}

const SEARCH_LIMIT = 15;

/** Create or edit one mock test, including the questions attached to it. */
export function MockTestForm({ testId: initialId }: { testId?: string }) {
  const [testId, setTestId] = React.useState<string | undefined>(initialId);
  const editing = Boolean(testId);

  const [loadState, setLoadState] = React.useState<LoadState>("loading");
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [linksReady, setLinksReady] = React.useState(true);
  const [modules, setModules] = React.useState<BankModule[]>([]);
  const [saved, setSaved] = React.useState<SavedState | null>(null);

  const [title, setTitle] = React.useState("");
  const [exam, setExam] = React.useState<Exam>("NDA");
  const [duration, setDuration] = React.useState("120");
  const [kind, setKind] = React.useState<TestKind>("mock");
  const [filing, setFiling] = React.useState<FilingInput>(emptyFiling());
  const [marksPerCorrect, setMarksPerCorrect] = React.useState("1");
  const [negativeMarks, setNegativeMarks] = React.useState("0");
  const [cutoffMin, setCutoffMin] = React.useState("");
  const [cutoffMax, setCutoffMax] = React.useState("");
  const taxonomy = useTaxonomy();
  // When editing, the saved subject and chapter are filled in once the folder list has loaded.
  const pendingFiling = React.useRef<{ subjectId: string; chapterId: string | null } | null>(null);
  const [published, setPublished] = React.useState(false);
  const [attached, setAttached] = React.useState<AttachedQuestion[]>([]);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [moduleFilter, setModuleFilter] = React.useState("all");
  const [results, setResults] = React.useState<AttachedQuestion[] | null>(null);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  const [saving, setSaving] = React.useState(false);
  const [banner, setBanner] = React.useState<Banner | null>(null);

  // Load the modules, check the join table exists, and (when editing) the test with its questions.
  React.useEffect(() => {
    let active = true;
    (async () => {
      const [moduleResult, probe] = await Promise.all([
        supabase.from("quizzes").select("id, title, category").order("title", { ascending: true }),
        supabase.from("test_questions").select("question_id").limit(1),
      ]);
      if (!active) return;
      if (moduleResult.error) {
        setLoadError(moduleResult.error.message);
        setLoadState("error");
        return;
      }
      setModules((moduleResult.data ?? []) as BankModule[]);
      const tableOk = !isMissingLinkTable(probe.error);
      setLinksReady(tableOk);

      if (!initialId) {
        setLoadState("ready");
        return;
      }

      const testResult = await supabase.from("mock_tests").select(MOCK_COLUMNS).eq("id", initialId).maybeSingle();
      if (!active) return;
      if (testResult.error) {
        setLoadError(testResult.error.message);
        setLoadState("error");
        return;
      }
      if (!testResult.data) {
        setLoadState("missing");
        return;
      }
      const test = testResult.data as unknown as MockTestRow;

      let questions: AttachedQuestion[] = [];
      if (tableOk) {
        const linkResult = await supabase
          .from("test_questions")
          .select("question_id, position, questions(id, quiz_id, question_text)")
          .eq("mock_test_id", initialId)
          .order("position", { ascending: true });
        if (!active) return;
        if (linkResult.error) {
          setLoadError(linkResult.error.message);
          setLoadState("error");
          return;
        }
        const links = (linkResult.data ?? []) as unknown as { questions: AttachedQuestion | null }[];
        questions = links.map((l) => l.questions).filter((q): q is AttachedQuestion => q !== null);
      }

      setTitle(test.title);
      setExam(test.target_exam);
      setDuration(String(test.duration_minutes));
      setKind(test.kind);
      pendingFiling.current = test.subject_id ? { subjectId: test.subject_id, chapterId: test.chapter_id } : null;
      setMarksPerCorrect(String(Number(test.marks_per_correct)));
      setNegativeMarks(String(Number(test.negative_marks)));
      setCutoffMin(test.cutoff_min === null ? "" : String(Number(test.cutoff_min)));
      setCutoffMax(test.cutoff_max === null ? "" : String(Number(test.cutoff_max)));
      setPublished(test.is_published);
      setAttached(questions);
      setSaved({
        title: test.title,
        exam: test.target_exam,
        duration: test.duration_minutes,
        kind: test.kind,
        subjectId: test.subject_id,
        chapterId: test.chapter_id,
        marksPerCorrect: Number(test.marks_per_correct),
        negativeMarks: Number(test.negative_marks),
        cutoffMin: test.cutoff_min === null ? null : Number(test.cutoff_min),
        cutoffMax: test.cutoff_max === null ? null : Number(test.cutoff_max),
        published: test.is_published,
        questionIds: questions.map((q) => q.id),
      });
      setLoadState("ready");
    })();
    return () => {
      active = false;
    };
  }, [initialId]);

  React.useEffect(() => {
    const pending = pendingFiling.current;
    if (!pending || taxonomy.loading) return;
    pendingFiling.current = null;
    const chapter = taxonomy.chapters.find((c) => c.id === pending.chapterId);
    setFiling({ subjectChoice: pending.subjectId, newSubjectName: "", chapterName: chapter?.name ?? "" });
  }, [taxonomy.loading, taxonomy.chapters, loadState]);

  // Wait a moment after typing before searching.
  React.useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    if (loadState !== "ready" || !linksReady) return;
    let active = true;
    let query = supabase.from("questions").select("id, quiz_id, question_text");
    if (moduleFilter !== "all") query = query.eq("quiz_id", moduleFilter);
    if (search) query = query.ilike("question_text", `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
    query
      .order("created_at", { ascending: false })
      .limit(SEARCH_LIMIT)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setSearchError(error.message);
          setResults([]);
          return;
        }
        setSearchError(null);
        setResults((data ?? []) as AttachedQuestion[]);
      });
    return () => {
      active = false;
    };
  }, [loadState, linksReady, search, moduleFilter]);

  const moduleTitle = React.useCallback(
    (id: string) => modules.find((m) => m.id === id)?.title ?? "Unknown module",
    [modules],
  );

  const attachedIds = React.useMemo(() => new Set(attached.map((q) => q.id)), [attached]);
  const atLimit = attached.length >= MOCK_LIMITS.questionsMax;

  const add = (q: AttachedQuestion) => {
    if (attachedIds.has(q.id) || atLimit) return;
    setBanner(null);
    setAttached((list) => [...list, q]);
  };
  const removeAt = (index: number) => setAttached((list) => list.filter((_, i) => i !== index));
  const move = (index: number, by: -1 | 1) =>
    setAttached((list) => {
      const target = index + by;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const problem = checkMockTest({
    title,
    kind,
    hasSubject: filing.subjectChoice !== "",
    hasChapter: filing.chapterName.trim() !== "",
    duration,
    marksPerCorrect,
    negativeMarks,
    cutoffMin,
    cutoffMax,
    published,
    questionCount: attached.length,
  });
  const totalMarks = totalMarksOf(attached.length, Number(marksPerCorrect) || 0);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setBanner(null);
    if (problem) {
      setBanner({ type: "error", text: problem });
      return;
    }
    if (!linksReady) {
      setBanner({ type: "error", text: "Run migration 006 in Supabase first, so questions can be attached." });
      return;
    }

    // A subject-wise or chapter-wise test is filed under a subject (and chapter). A new one is created on the spot.
    let subjectId: string | null = null;
    let chapterId: string | null = null;
    if (kind !== "mock") {
      const filed = checkFiling(filing, taxonomy.subjects, taxonomy.chapters);
      if (!filed.ok) {
        setBanner({ type: "error", text: filed.error });
        return;
      }
      setSaving(true);
      const made = await saveFiling(filed, [exam.toLowerCase() as ExamId]);
      setSaving(false);
      if (!made.ok) {
        setBanner({ type: "error", text: made.error });
        return;
      }
      subjectId = made.subject.id;
      chapterId = kind === "chapter" ? (made.chapter?.id ?? null) : null;
    }

    const fields = {
      title: title.trim(),
      target_exam: exam,
      kind,
      subject_id: subjectId,
      chapter_id: chapterId,
      duration_minutes: Number(duration),
      marks_per_correct: Number(marksPerCorrect),
      negative_marks: Number(negativeMarks || "0"),
      cutoff_min: cutoffMin.trim() === "" ? null : Number(cutoffMin),
      cutoff_max: cutoffMax.trim() === "" ? null : Number(cutoffMax),
      total_marks: totalMarksOf(attached.length, Number(marksPerCorrect)),
      passing_marks: 0,
      is_published: published,
      total_questions: attached.length,
    };
    const ids = attached.map((q) => q.id);
    const linkRows = (id: string) => attached.map((q, i) => ({ mock_test_id: id, question_id: q.id, position: i + 1 }));

    setSaving(true);

    // ---- Create ---------------------------------------------------------
    if (!testId) {
      const code = await nextMockCode(exam, kind);
      const created = await supabase.from("mock_tests").insert({ ...fields, code }).select("id");
      if (created.error || !created.data?.length) {
        setSaving(false);
        setBanner({ type: "error", text: `The mock test was not saved: ${created.error?.message ?? "you may not have permission"}.` });
        return;
      }
      const newId = (created.data[0] as { id: string }).id;
      setTestId(newId);
      window.history.replaceState(null, "", `/admin/mock-tests/${newId}/edit`);

      let linkFailure: string | null = null;
      if (ids.length > 0) {
        const linked = await supabase.from("test_questions").upsert(linkRows(newId), { onConflict: "mock_test_id,question_id" });
        if (linked.error) linkFailure = linked.error.message;
      }
      setSaving(false);

      await logAdminAction({
        action: "added",
        entityType: "mock_test",
        label: fields.title,
        details: { mock_test_id: newId, code, exam, kind, duration_minutes: fields.duration_minutes, total_marks: fields.total_marks, questions: ids.length, published },
      });

      setSaved({
        title: fields.title,
        exam,
        duration: fields.duration_minutes,
        kind,
        subjectId,
        chapterId,
        marksPerCorrect: fields.marks_per_correct,
        negativeMarks: fields.negative_marks,
        cutoffMin: fields.cutoff_min,
        cutoffMax: fields.cutoff_max,
        published,
        questionIds: linkFailure ? [] : ids,
      });
      setBanner(
        linkFailure
          ? { type: "error", text: `"${fields.title}" was created, but its questions were not attached: ${linkFailure}. Press Save Changes to try again.` }
          : { type: "success", text: `"${fields.title}" was created as ${code} with ${ids.length} question${ids.length === 1 ? "" : "s"}${published ? " and is live for cadets" : " as a draft"}.` },
      );
      return;
    }

    // ---- Edit -----------------------------------------------------------
    const before = saved;
    const changed: string[] = [];
    if (before) {
      if (before.title !== fields.title) changed.push("title");
      if (before.exam !== fields.target_exam) changed.push("exam");
      if (before.duration !== fields.duration_minutes) changed.push("duration");
      if (before.kind !== fields.kind) changed.push("test type");
      if (before.subjectId !== fields.subject_id || before.chapterId !== fields.chapter_id) changed.push("subject or chapter");
      if (before.marksPerCorrect !== fields.marks_per_correct || before.negativeMarks !== fields.negative_marks) changed.push("marking");
      if (before.cutoffMin !== fields.cutoff_min || before.cutoffMax !== fields.cutoff_max) changed.push("cutoff");
      if (before.published !== fields.is_published) changed.push(fields.is_published ? "published" : "unpublished");
    }
    const previousIds = before?.questionIds ?? [];
    const addedIds = ids.filter((id) => !previousIds.includes(id));
    const removedIds = previousIds.filter((id) => !ids.includes(id));
    const orderChanged = addedIds.length === 0 && removedIds.length === 0 && previousIds.join() !== ids.join();
    if (addedIds.length) changed.push(`${addedIds.length} question${addedIds.length === 1 ? "" : "s"} added`);
    if (removedIds.length) changed.push(`${removedIds.length} question${removedIds.length === 1 ? "" : "s"} removed`);
    if (orderChanged) changed.push("question order");

    if (changed.length === 0) {
      setSaving(false);
      setBanner({ type: "error", text: "Nothing has changed yet." });
      return;
    }

    const updated = await supabase.from("mock_tests").update(fields).eq("id", testId).select("id");
    if (updated.error || !updated.data?.length) {
      setSaving(false);
      setBanner({ type: "error", text: `The changes were not saved: ${updated.error?.message ?? "you may not have permission"}.` });
      return;
    }

    let linkFailure: string | null = null;
    if (removedIds.length > 0) {
      const removed = await supabase.from("test_questions").delete().eq("mock_test_id", testId).in("question_id", removedIds);
      if (removed.error) linkFailure = removed.error.message;
    }
    if (!linkFailure && ids.length > 0) {
      const linked = await supabase.from("test_questions").upsert(linkRows(testId), { onConflict: "mock_test_id,question_id" });
      if (linked.error) linkFailure = linked.error.message;
    }
    setSaving(false);

    await logAdminAction({
      action: "edited",
      entityType: "mock_test",
      label: fields.title,
      details: { mock_test_id: testId, changed, questions: ids.length, ...(linkFailure ? { question_error: linkFailure } : {}) },
    });

    if (linkFailure) {
      setBanner({ type: "error", text: `The test details were saved, but the questions were not updated: ${linkFailure}. Press Save Changes to try again.` });
      return;
    }
    setSaved({
      title: fields.title,
      exam,
      duration: fields.duration_minutes,
      kind,
      subjectId,
      chapterId,
      marksPerCorrect: fields.marks_per_correct,
      negativeMarks: fields.negative_marks,
      cutoffMin: fields.cutoff_min,
      cutoffMax: fields.cutoff_max,
      published,
      questionIds: ids,
    });
    setBanner({ type: "success", text: `"${fields.title}" was updated (${changed.join(", ")}).` });
  };

  if (loadState === "loading") {
    return (
      <SkeletonGroup label="Loading the mock test form" className="space-y-6">
        <Skeleton className="h-10 w-72 rounded-control" />
        <Skeleton className="h-56 w-full rounded-panel" />
        <Skeleton className="h-72 w-full rounded-panel" />
      </SkeletonGroup>
    );
  }

  if (loadState === "error" || loadState === "missing") {
    return (
      <Card>
        <CardContent className="space-y-4 py-10 text-center">
          <p className="text-lg font-bold text-white">
            {loadState === "missing" ? "That mock test was not found" : "The form could not be loaded"}
          </p>
          <p role={loadState === "error" ? "alert" : undefined} className="text-sm text-steel-300">
            {loadState === "missing" ? "It may have been deleted." : (loadError ?? "Something went wrong.")}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/mock-tests">Back to Mock Tests</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={save} className="space-y-8" noValidate>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="gold" className="mb-2">Test Center</Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white">
            {editing ? "Edit Test" : "Create Test"}
          </h1>
          <p className="mt-1 text-sm text-steel-300">Choose the type, set the marking, attach questions from the bank, then save.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/mock-tests">Back to Mock Tests</Link>
        </Button>
      </div>

      {!linksReady ? (
        <p className="rounded-control border border-gold-400/30 bg-gold-400/5 p-3 text-xs text-gold-300">
          Questions cannot be attached yet. Run migration 006 in Supabase (SQL Editor), then reload this page.
        </p>
      ) : null}

      {banner ? (
        <div
          role={banner.type === "error" ? "alert" : "status"}
          className={
            banner.type === "error"
              ? "rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400"
              : "flex flex-wrap items-center justify-between gap-3 rounded-control border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs font-semibold text-emerald-300"
          }
        >
          <span>{banner.text}</span>
          {banner.type === "success" ? (
            <Link href="/admin/mock-tests" className="underline underline-offset-2 hover:text-emerald-200">
              View all mock tests
            </Link>
          ) : null}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Test Details</CardTitle>
          <CardDescription>What cadets see on the Test Center card.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mt-title">Test title</Label>
            <Input
              id="mt-title"
              required
              maxLength={MOCK_LIMITS.titleMax}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="NDA Maths Full Mock 01"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mt-kind">Test type</Label>
            <Select id="mt-kind" value={kind} onChange={(e) => setKind(e.target.value as TestKind)}>
              {TEST_KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </Select>
          </div>
          {kind !== "mock" ? (
            <div className="space-y-2 rounded-control border border-steel-700/60 bg-navy-950 p-3">
              <p className="text-xs text-steel-300">
                {kind === "subject" ? "Pick the subject this test is for." : "Pick the subject and chapter this test is for."} Type a new one if it is not in the list.
              </p>
              <FilingFields idPrefix="mt-file" subjects={taxonomy.subjects} chapters={taxonomy.chapters} value={filing} onChange={setFiling} disabled={saving} />
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="mt-exam">Exam</Label>
              <Select id="mt-exam" value={exam} onChange={(e) => setExam(e.target.value as Exam)}>
                {EXAMS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mt-duration">Time (minutes)</Label>
              <Input id="mt-duration" type="number" inputMode="numeric" required min={1} max={MOCK_LIMITS.durationMax} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mt-total">Total marks</Label>
              <Input id="mt-total" readOnly value={String(totalMarks)} aria-describedby="mt-total-hint" />
              <p id="mt-total-hint" className="text-xs text-steel-500">{attached.length} questions x marks for a right answer. Worked out for you.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mt-plus">Marks for a right answer</Label>
              <Input id="mt-plus" type="number" inputMode="decimal" step="any" required min={0} value={marksPerCorrect} onChange={(e) => setMarksPerCorrect(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mt-minus">Marks taken off for a wrong answer</Label>
              <Input id="mt-minus" type="number" inputMode="decimal" step="any" min={0} value={negativeMarks} onChange={(e) => setNegativeMarks(e.target.value)} />
              <p className="text-xs text-steel-500">Write 0 for no negative marking.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mt-cut-min">Cutoff range (marks)</Label>
              <div className="flex items-center gap-2">
                <Input id="mt-cut-min" type="number" inputMode="decimal" step="any" min={0} placeholder="Lowest" value={cutoffMin} onChange={(e) => setCutoffMin(e.target.value)} aria-label="Lowest expected cutoff" />
                <span className="text-xs text-steel-500">to</span>
                <Input id="mt-cut-max" type="number" inputMode="decimal" step="any" min={0} placeholder="Highest" value={cutoffMax} onChange={(e) => setCutoffMax(e.target.value)} aria-label="Highest expected cutoff" />
              </div>
              <p className="text-xs text-steel-500">Optional. Shown to students beside their score.</p>
            </div>
          </div>
          <label htmlFor="mt-published" className="flex cursor-pointer items-start gap-3 rounded-control border border-steel-700/60 bg-navy-950 p-3">
            <input
              id="mt-published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-gold-400"
            />
            <span>
              <span className="block text-sm font-semibold text-white">Publish for cadets</span>
              <span className="block text-xs text-steel-300">
                Off keeps it as a draft that only admins can see. A published test needs at least one question.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Find Questions</CardTitle>
            <CardDescription>Search the question bank and add what belongs in this test.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label htmlFor="mt-search" className="sr-only">Search question text</label>
              <Input
                id="mt-search"
                type="search"
                placeholder="Search question text..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoComplete="off"
                disabled={!linksReady}
              />
            </div>
            <div>
              <label htmlFor="mt-module" className="sr-only">Filter by module</label>
              <Select id="mt-module" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} disabled={!linksReady}>
                <option value="all">All modules</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.category}] {m.title}
                  </option>
                ))}
              </Select>
            </div>

            {searchError ? <p role="alert" className="text-xs text-danger-400">Could not search: {searchError}</p> : null}
            {linksReady && results === null ? <p className="text-xs text-steel-300">Loading questions...</p> : null}
            {results && results.length === 0 && !searchError ? (
              <p className="text-xs text-steel-300">{search || moduleFilter !== "all" ? "No questions match." : "The question bank is empty."}</p>
            ) : null}

            {results && results.length > 0 ? (
              <>
                <ul className="divide-y divide-steel-700/40 rounded-control border border-steel-700/60 bg-navy-950">
                  {results.map((q) => {
                    const isAdded = attachedIds.has(q.id);
                    return (
                      <li key={q.id} className="flex items-start justify-between gap-3 p-3">
                        <div className="min-w-0 space-y-1">
                          <Badge variant="outline">{moduleTitle(q.quiz_id)}</Badge>
                          <p className="line-clamp-2 text-sm text-steel-100">{q.question_text}</p>
                        </div>
                        <Button
                          type="button"
                          variant={isAdded ? "ghost" : "outline"}
                          size="sm"
                          className="shrink-0"
                          disabled={isAdded || atLimit}
                          onClick={() => add(q)}
                          aria-label={`${isAdded ? "Already added" : "Add"}: ${clip(q.question_text, 60)}`}
                        >
                          {isAdded ? "Added" : "Add"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs text-steel-500">Showing the {SEARCH_LIMIT} newest matches. Search to narrow it down.</p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Questions in this Test</CardTitle>
            <CardDescription>
              <span role="status">
                {attached.length} of {MOCK_LIMITS.questionsMax} added. Cadets see them in this order.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attached.length === 0 ? (
              <p className="rounded-control border border-dashed border-steel-700 p-6 text-center text-sm text-steel-300">
                No questions yet. Use Add on the left.
              </p>
            ) : (
              <ol className="space-y-2">
                {attached.map((q, i) => (
                  <li key={q.id} className="flex items-start gap-3 rounded-control border border-steel-700/60 bg-navy-950 p-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-800 font-mono text-xs font-bold text-gold-300">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <Badge variant="outline">{moduleTitle(q.quiz_id)}</Badge>
                      <p className="line-clamp-2 text-sm text-steel-100">{q.question_text}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" className="size-8" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move question ${i + 1} up`}>
                        <Icons.chevronRight className="size-4 -rotate-90" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="size-8" disabled={i === attached.length - 1} onClick={() => move(i, 1)} aria-label={`Move question ${i + 1} down`}>
                        <Icons.chevronRight className="size-4 rotate-90" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeAt(i)} aria-label={`Remove question ${i + 1}`}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 border-t border-steel-700/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-steel-300" aria-live="polite">
          {problem ? `Not ready: ${problem}` : "Ready to save."}
        </p>
        <Button type="submit" size="lg" loading={saving} className="w-full sm:w-auto sm:min-w-56">
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Icons.checkCircle className="size-4" />
              {editing ? "Save Changes" : "Create Mock Test"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
