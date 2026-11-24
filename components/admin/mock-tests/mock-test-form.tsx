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
import { PdfImport, type PdfReading } from "@/components/admin/mock-tests/pdf-import";
import { QuestionEditor } from "@/components/admin/mock-tests/question-editor";
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
import { blankQuestion, insertAfter, moveItem, newKey, questionProblems, signatureOf, summarise, type BuilderQuestion } from "@/lib/test-questions";
import { removeTestPdf, savedMapOf, saveTestQuestions, uploadTestPdf, type SavedQuestions } from "@/lib/test-save";

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
  sourcePdf: string | null;
}

const SEARCH_LIMIT = 15;

/** Create or edit one mock test, including the questions attached to it. */
export function MockTestForm({ testId: initialId, initialKind }: { testId?: string; initialKind?: TestKind }) {
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
  const [kind, setKind] = React.useState<TestKind>(initialKind ?? "mock");
  const [filing, setFiling] = React.useState<FilingInput>(emptyFiling());
  const [marksPerCorrect, setMarksPerCorrect] = React.useState("1");
  const [negativeMarks, setNegativeMarks] = React.useState("0");
  const [cutoffMin, setCutoffMin] = React.useState("");
  const [cutoffMax, setCutoffMax] = React.useState("");
  const taxonomy = useTaxonomy();
  // When editing, the saved subject and chapter are filled in once the folder list has loaded.
  const pendingFiling = React.useRef<{ subjectId: string; chapterId: string | null } | null>(null);
  const [published, setPublished] = React.useState(false);
  const [attached, setAttached] = React.useState<BuilderQuestion[]>([]);
  const [savedQuestions, setSavedQuestions] = React.useState<SavedQuestions>(new Map());
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [pdfWarnings, setPdfWarnings] = React.useState<string[]>([]);
  const [sourcePdf, setSourcePdf] = React.useState<string | null>(null);
  const [openKey, setOpenKey] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<"pdf" | "type" | "bank">("pdf");

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

      let questions: BuilderQuestion[] = [];
      if (tableOk) {
        const linkResult = await supabase
          .from("test_questions")
          .select("question_id, position, questions(id, quiz_id, mock_test_id, question_text, option_a, option_b, option_c, option_d, topic, question_answers(correct_option, explanation))")
          .eq("mock_test_id", initialId)
          .order("position", { ascending: true });
        if (!active) return;
        if (linkResult.error) {
          setLoadError(linkResult.error.message);
          setLoadState("error");
          return;
        }
        type Embed = { correct_option?: string | null; explanation?: string | null };
        type Row = { id: string; quiz_id: string | null; mock_test_id: string | null; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; topic: string | null; question_answers: Embed | Embed[] | null };
        const links = (linkResult.data ?? []) as unknown as { questions: Row | null }[];
        questions = links
          .map((l) => l.questions)
          .filter((q): q is Row => q !== null)
          .map((q) => {
            const owned = q.mock_test_id === initialId;
            const key = Array.isArray(q.question_answers) ? q.question_answers[0] : q.question_answers;
            const letter = (key?.correct_option ?? "").trim().toUpperCase();
            return {
              key: newKey(),
              id: q.id,
              owned,
              text: q.question_text,
              options: owned ? { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d } : { A: "", B: "", C: "", D: "" },
              correct: (["A", "B", "C", "D"].includes(letter) ? letter : "") as BuilderQuestion["correct"],
              explanation: owned ? (key?.explanation ?? "") : "",
              tag: owned ? (q.topic ?? "") : "",
              flags: [],
              moduleTitle: q.quiz_id ? (((moduleResult.data ?? []) as BankModule[]).find((m) => m.id === q.quiz_id)?.title ?? "Question bank") : undefined,
            };
          });
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
      setSavedQuestions(savedMapOf(questions));
      setSourcePdf(test.source_pdf);
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
        questionIds: questions.map((q) => q.id as string),
        sourcePdf: test.source_pdf,
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
    let query = supabase.from("questions").select("id, quiz_id, question_text").is("mock_test_id", null);
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

  const attachedIds = React.useMemo(() => new Set(attached.map((q) => q.id).filter(Boolean)), [attached]);
  const atLimit = attached.length >= MOCK_LIMITS.questionsMax;

  const add = (q: AttachedQuestion) => {
    if (attachedIds.has(q.id) || atLimit) return;
    setBanner(null);
    setAttached((list) => [
      ...list,
      { ...blankQuestion(), id: q.id, owned: false, text: q.question_text, moduleTitle: moduleTitle(q.quiz_id) },
    ]);
  };
  const addBlank = (after: number) => {
    if (atLimit) return;
    const fresh = blankQuestion();
    setAttached((list) => insertAfter(list, after, fresh));
    setOpenKey(fresh.key);
  };
  const removeAt = (index: number) => setAttached((list) => list.filter((_, i) => i !== index));
  const move = (index: number, by: -1 | 1) => setAttached((list) => moveItem(list, index, by));
  const change = (index: number, next: BuilderQuestion) => setAttached((list) => list.map((q, i) => (i === index ? next : q)));

  // A PDF read while the form already holds questions waits here until the admin says what to do with it.
  const [pendingPdf, setPendingPdf] = React.useState<PdfReading | null>(null);

  const importReading = (reading: PdfReading, base: BuilderQuestion[]) => {
    setBanner(null);
    const room = Math.max(0, MOCK_LIMITS.questionsMax - base.length);
    setAttached([...base, ...reading.questions.slice(0, room)]);
    setPdfFile(reading.file);
    setPdfWarnings(reading.warnings);
    const first = reading.questions.find((q) => q.flags.length > 0) ?? reading.questions[0];
    setOpenKey(first?.key ?? null);
    setTitle((current) => (current.trim() ? current : reading.file.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim().slice(0, MOCK_LIMITS.titleMax)));
  };

  /** Clears the form for another test. The exam, time and marking stay, since a series is usually alike. Subject stays; the chapter must be typed again. */
  const startNewTest = () => {
    setTestId(undefined);
    setSaved(null);
    setTitle("");
    setPublished(false);
    setAttached([]);
    setSavedQuestions(new Map());
    setPdfFile(null);
    setPdfWarnings([]);
    setSourcePdf(null);
    setOpenKey(null);
    setPendingPdf(null);
    setBanner(null);
    setFiling((f) => ({ ...f, chapterName: "" }));
    pendingFiling.current = null;
    window.history.replaceState(null, "", `/admin/mock-tests/new?kind=${kind}`);
  };

  const onPdfRead = (reading: PdfReading) => {
    if (attached.length === 0) importReading(reading, []);
    else setPendingPdf(reading);
  };

  const summary = summarise(attached);
  const unfinished = attached.map((q, i) => ({ n: i + 1, problems: questionProblems(q) })).filter((x) => x.problems.length > 0);

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
  const blocked = problem ?? (unfinished.length > 0 ? `Question ${unfinished[0].n}: ${unfinished[0].problems[0]}` : null);
  const totalMarks = totalMarksOf(attached.length, Number(marksPerCorrect) || 0);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setBanner(null);
    if (blocked) {
      setBanner({ type: "error", text: blocked });
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

    setSaving(true);

    // The original PDF is stored first, so students can download exactly this file later.
    let newPdfPath: string | null = null;
    if (pdfFile) {
      const stored = await uploadTestPdf(pdfFile);
      if ("error" in stored) {
        setSaving(false);
        setBanner({ type: "error", text: `The PDF was not stored: ${stored.error}` });
        return;
      }
      newPdfPath = stored.path;
    }
    const pdfPath = newPdfPath ?? sourcePdf;

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
      source_pdf: pdfPath,
    };

    const finishQuestions = async (id: string) => {
      const result = await saveTestQuestions(id, attached, savedQuestions);
      setAttached(result.list);
      if (result.ok) {
        setSavedQuestions(savedMapOf(result.list));
        setPdfFile(null);
        setPdfWarnings([]);
        if (newPdfPath) {
          if (sourcePdf && sourcePdf !== newPdfPath) await removeTestPdf(sourcePdf);
          setSourcePdf(newPdfPath);
        }
      }
      return result;
    };
    const savedSnapshot = (ids: string[]): SavedState => ({
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
      sourcePdf: pdfPath,
    });

    // ---- Create ---------------------------------------------------------
    if (!testId) {
      const code = await nextMockCode(exam, kind);
      // A new test is saved as a draft first, and published only once every question is in.
      const created = await supabase.from("mock_tests").insert({ ...fields, is_published: false, code }).select("id");
      if (created.error || !created.data?.length) {
        setSaving(false);
        if (newPdfPath) await removeTestPdf(newPdfPath);
        setBanner({ type: "error", text: `The test was not saved: ${created.error?.message ?? "you may not have permission"}.` });
        return;
      }
      const newId = (created.data[0] as { id: string }).id;
      setTestId(newId);
      window.history.replaceState(null, "", `/admin/mock-tests/${newId}/edit`);

      const result = await finishQuestions(newId);
      if (result.ok && published) {
        const live = await supabase.from("mock_tests").update({ is_published: true }).eq("id", newId).select("id");
        if (live.error || !live.data?.length) result.error = `The test could not be published: ${live.error?.message ?? "you may not have permission"}`;
      }
      setSaving(false);

      await logAdminAction({
        action: "added",
        entityType: "mock_test",
        label: fields.title,
        details: { mock_test_id: newId, code, exam, kind, duration_minutes: fields.duration_minutes, total_marks: fields.total_marks, questions: attached.length, published },
      });

      const ids = result.list.map((q) => q.id).filter((id): id is string => Boolean(id));
      setSaved(savedSnapshot(result.ok ? ids : []));
      setBanner(
        result.ok && !result.error
          ? { type: "success", text: `"${fields.title}" was created as ${code} with ${attached.length} question${attached.length === 1 ? "" : "s"}${published ? " and is live for cadets" : " as a draft"}.` }
          : { type: "error", text: `"${fields.title}" was created, but not everything was saved: ${result.error}. Press Save Changes to try again.` },
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
      if (newPdfPath) changed.push("question PDF");
    }
    const ids = attached.map((q) => q.id);
    const previousIds = before?.questionIds ?? [];
    const addedCount = attached.filter((q) => !q.id || !savedQuestions.has(q.id)).length;
    const removedCount = previousIds.filter((id) => !ids.includes(id)).length;
    const editedCount = attached.filter((q) => q.id && q.owned && savedQuestions.get(q.id) && savedQuestions.get(q.id)?.signature !== signatureOf(q)).length;
    const orderChanged = addedCount === 0 && removedCount === 0 && previousIds.join() !== ids.join();
    if (addedCount) changed.push(`${addedCount} question${addedCount === 1 ? "" : "s"} added`);
    if (removedCount) changed.push(`${removedCount} question${removedCount === 1 ? "" : "s"} removed`);
    if (editedCount) changed.push(`${editedCount} question${editedCount === 1 ? "" : "s"} edited`);
    if (orderChanged) changed.push("question order");

    if (changed.length === 0) {
      setSaving(false);
      setBanner({ type: "error", text: "Nothing has changed yet." });
      return;
    }

    const updated = await supabase.from("mock_tests").update(fields).eq("id", testId).select("id");
    if (updated.error || !updated.data?.length) {
      setSaving(false);
      if (newPdfPath) await removeTestPdf(newPdfPath);
      setBanner({ type: "error", text: `The changes were not saved: ${updated.error?.message ?? "you may not have permission"}.` });
      return;
    }

    const result = await finishQuestions(testId);
    setSaving(false);

    await logAdminAction({
      action: "edited",
      entityType: "mock_test",
      label: fields.title,
      details: { mock_test_id: testId, changed, questions: attached.length, ...(result.error ? { question_error: result.error } : {}) },
    });

    if (!result.ok) {
      setBanner({ type: "error", text: `The test details were saved, but the questions were not updated: ${result.error}. Press Save Changes to try again.` });
      return;
    }
    setSaved(savedSnapshot(result.list.map((q) => q.id as string)));
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
            <Link href={`/admin/questions?tab=${kind}`}>Back to Question Bank</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={save} className="space-y-8" noValidate>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="gold" className="mb-2">Question Bank</Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white">
            {editing ? `Edit ${KIND_LABEL[kind]}` : `Add a ${KIND_LABEL[kind]}`}
          </h1>
          <p className="mt-1 text-sm text-steel-300">Choose the type, set the marking, add questions by PDF, typing or the bank, check them, then save.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/questions?tab=${kind}`}>Back to Question Bank</Link>
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
            <span className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={startNewTest} className="underline underline-offset-2 hover:text-emerald-200">
                Add another test
              </button>
              <Link href={`/admin/questions?tab=${kind}`} className="underline underline-offset-2 hover:text-emerald-200">
                Back to the Question Bank
              </Link>
            </span>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Add Questions</CardTitle>
          <CardDescription>Upload a PDF, type questions yourself, or pick from the question bank. You can mix all three.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="How to add questions">
            {([["pdf", "Upload a PDF"], ["type", "Type a question"], ["bank", "From the question bank"]] as const).map(([id, label]) => (
              <Button key={id} type="button" role="tab" aria-selected={tab === id} size="sm" variant={tab === id ? "primary" : "outline"} onClick={() => setTab(id)}>
                {label}
              </Button>
            ))}
          </div>

          {pendingPdf ? (
            <div role="group" aria-label="What to do with this PDF" className="space-y-3 rounded-control border border-gold-400/40 bg-gold-400/5 p-4">
              <p className="text-sm font-semibold text-white">
                {pendingPdf.questions.length} questions were read from {pendingPdf.file.name}. This test already has {attached.length}. What should happen?
              </p>
              <p className="text-xs text-steel-300">
                {editing
                  ? "This test is already saved. A PDF for another chapter or paper should be its own test, so its marks, time and results stay separate."
                  : "Questions from different chapters or papers should be separate tests, so marks and results are not mixed."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const reading = pendingPdf;
                    if (editing || attached.length === 0) startNewTest();
                    else {
                      setAttached([]);
                      setPdfFile(null);
                      setPdfWarnings([]);
                      setOpenKey(null);
                      setTitle("");
                    }
                    setPendingPdf(null);
                    importReading(reading, []);
                  }}
                >
                  {editing ? "Make a new test from this PDF" : "Start over with this PDF"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { importReading(pendingPdf, attached); setPendingPdf(null); }}>
                  Add to this test anyway
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setPendingPdf(null)}>
                  Cancel
                </Button>
              </div>
              {editing || sourcePdf || pdfFile ? <p className="text-xs text-steel-500">Adding to this test replaces its downloadable PDF with the new one.</p> : null}
            </div>
          ) : null}

          {tab === "pdf" ? <PdfImport disabled={atLimit || pendingPdf !== null} onRead={onPdfRead} /> : null}

          {tab === "type" ? (
            <div className="space-y-2">
              <p className="text-xs text-steel-300">Adds an empty question at the end of the list. Fill in the question, four options, the correct one and, if you like, an explanation.</p>
              <Button type="button" variant="outline" disabled={atLimit} onClick={() => addBlank(-1)}>
                <Icons.plus className="size-4" />
                Add a question
              </Button>
            </div>
          ) : null}

          {tab === "bank" ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="mt-search" className="sr-only">Search question text</label>
                <Input id="mt-search" type="search" placeholder="Search question text..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} autoComplete="off" disabled={!linksReady} />
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
                          <Button type="button" variant={isAdded ? "ghost" : "outline"} size="sm" className="shrink-0" disabled={isAdded || atLimit} onClick={() => add(q)} aria-label={`${isAdded ? "Already added" : "Add"}: ${clip(q.question_text, 60)}`}>
                            {isAdded ? "Added" : "Add"}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-xs text-steel-500">Showing the {SEARCH_LIMIT} newest matches. Search to narrow it down.</p>
                </>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Questions in this Test</CardTitle>
          <CardDescription>
            <span role="status">
              {attached.length} of {MOCK_LIMITS.questionsMax} added
              {summary.needWork > 0 ? `, ${summary.needWork} unfinished` : ""}
              {summary.flagged > 0 ? `, ${summary.flagged} to check` : ""}. Open a question to edit it or preview it as a student sees it.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pdfFile ? (
            <p className="rounded-control border border-steel-700/60 bg-navy-950 p-3 text-xs text-steel-300">
              From <span className="font-semibold text-white">{pdfFile.name}</span>. This PDF is saved with the test and students can download it as it is.
            </p>
          ) : sourcePdf ? (
            <p className="rounded-control border border-steel-700/60 bg-navy-950 p-3 text-xs text-steel-300">This test has its original PDF saved. Uploading another PDF replaces it.</p>
          ) : null}
          {pdfWarnings.length > 0 ? (
            <ul className="space-y-1 rounded-control border border-gold-400/30 bg-gold-400/5 p-3 text-xs text-gold-300">
              {pdfWarnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
          {attached.length === 0 ? (
            <p className="rounded-control border border-dashed border-steel-700 p-6 text-center text-sm text-steel-300">No questions yet. Upload a PDF, type one, or pick from the bank above.</p>
          ) : (
            <ol className="space-y-2">
              {attached.map((q, i) => (
                <QuestionEditor
                  key={q.key}
                  index={i}
                  total={attached.length}
                  question={q}
                  open={openKey === q.key}
                  onToggle={() => setOpenKey((k) => (k === q.key ? null : q.key))}
                  onChange={(next) => change(i, next)}
                  onMove={(by) => move(i, by)}
                  onRemove={() => removeAt(i)}
                  onAddBelow={() => addBlank(i)}
                  moduleName={q.moduleTitle}
                />
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 border-t border-steel-700/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-steel-300" aria-live="polite">
          {blocked ? `Not ready: ${blocked}` : "Ready to save."}
        </p>
        <Button type="submit" size="lg" loading={saving} className="w-full sm:w-auto sm:min-w-56">
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Icons.checkCircle className="size-4" />
              {editing ? "Save Changes" : "Create Test"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
