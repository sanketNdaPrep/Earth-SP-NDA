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
import { buildFolders } from "@/lib/taxonomy";
import { emptyFiling, FilingFields } from "@/components/admin/filing-fields";
import { checkFiling, type FilingInput } from "@/lib/filing";
import { saveFiling } from "@/lib/filing-save";
import { useStepState } from "@/hooks/use-step-state";
import { BackButton, ChapterThumb, plural } from "@/components/vault/folder-parts";
import { subjectCoverUrl } from "@/components/flashcards/picture-url";
import type { ExamId } from "@/lib/subjects";
import { cutoffText, KIND_SHORT, type TestKind } from "@/lib/test-settings";
import { Notice } from "@/components/ui/notice";

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

const OTHER = "other";
const LOOSE = "loose";
const EXAMS = ["NDA", "CDS", "AFCAT"] as const;

/** Where the admin is: nothing open, a folder (a subject, or an exam for full mocks), or a chapter inside it. */
interface Place {
  subjectId: string | null;
  chapter: string | null;
}
const TOP: Place = { subjectId: null, chapter: null };

function FolderCard({ name, detail, cover, onOpen }: { name: string; detail: string; cover?: string | null; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full overflow-hidden rounded-panel border border-steel-700/60 bg-navy-900 text-left transition-colors hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
    >
      <div className="flex aspect-4/3 w-full items-center justify-center bg-navy-950">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={subjectCoverUrl(cover)} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <Icons.book className="size-10 text-steel-500 transition-colors group-hover:text-gold-400" aria-hidden />
        )}
      </div>
      <div className="space-y-1 px-3 py-3">
        <p className="truncate text-sm font-bold text-white group-hover:text-gold-300">{name}</p>
        <p className="font-mono text-xs text-steel-300">{detail}</p>
      </div>
    </button>
  );
}

/**
 * Every test of one kind, in folders like the flashcards: subject, then chapter (chapter-wise), then the tests.
 * Full mock tests sit in a folder for each exam. At every level the admin can tick tests, move them or delete them.
 */
export function TestList({ kind }: { kind: TestKind }) {
  const [tests, setTests] = React.useState<MockTestRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [notice, setNotice] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [place, pushPlace, upPlace] = useStepState<Place>(TOP, `admin-tests-${kind}`);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [moveFiling, setMoveFiling] = React.useState<FilingInput>(emptyFiling());
  const taxonomy = useTaxonomy(version);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("mock_tests")
      .select(MOCK_COLUMNS)
      .eq("kind", kind)
      .order("created_at", { ascending: true })
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

  const refresh = () => setVersion((v) => v + 1);
  const goTo = (next: Place) => {
    pushPlace(next);
    setSelected(new Set());
    setNotice(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
  const goUp = (parent: Place) => {
    upPlace(parent);
    setSelected(new Set());
    setNotice(null);
  };
  const toggle = (ids: readonly string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  /** Deletes tests (their own questions go with them; shared bank questions stay) and their saved PDFs. */
  const removeTests = async (list: MockTestRow[]) => {
    if (list.length === 0) return;
    setNotice(null);
    setBusy(true);
    const { data, error: deleteError } = await supabase.from("mock_tests").delete().in("id", list.map((t) => t.id)).select("id");
    if (deleteError || !data?.length) {
      setBusy(false);
      setNotice({ type: "error", text: `Nothing was deleted: ${deleteError?.message ?? "you may not have permission"}.` });
      return;
    }
    const gone = new Set((data as { id: string }[]).map((r) => r.id));
    const done = list.filter((t) => gone.has(t.id));
    const pdfs = done.map((t) => t.source_pdf).filter((x): x is string => Boolean(x));
    if (pdfs.length > 0) await supabase.storage.from("study-materials").remove(pdfs);
    await Promise.all(
      done.map((t) =>
        logAdminAction({
          action: "deleted",
          entityType: "mock_test",
          label: t.title,
          details: { mock_test_id: t.id, code: t.code, exam: t.target_exam, kind: t.kind, questions: t.total_questions, was_published: t.is_published },
        }),
      ),
    );
    setBusy(false);
    setSelected(new Set());
    setNotice({ type: "success", text: done.length === 1 ? `"${done[0].title}" was deleted with its questions.` : `${done.length} tests were deleted with their questions.` });
    refresh();
  };

  /** Moves the ticked tests to another subject (and chapter, for chapter-wise tests). */
  const moveSelected = async () => {
    const list = (tests ?? []).filter((t) => selected.has(t.id));
    const check = checkFiling(moveFiling, taxonomy.subjects, taxonomy.chapters);
    if (!check.ok) return setNotice({ type: "error", text: check.error });
    if (kind === "chapter" && !check.chapterName) return setNotice({ type: "error", text: "Type the chapter these tests belong to." });
    setBusy(true);
    setNotice(null);
    const exams = [...new Set(list.map((t) => t.target_exam.toLowerCase()))] as ExamId[];
    const saved = await saveFiling(check, exams);
    if (!saved.ok) {
      setBusy(false);
      return setNotice({ type: "error", text: saved.error });
    }
    const { data, error: updateError } = await supabase
      .from("mock_tests")
      .update({ subject_id: saved.subject.id, chapter_id: kind === "chapter" ? (saved.chapter?.id ?? null) : null })
      .in("id", list.map((t) => t.id))
      .select("id");
    setBusy(false);
    if (updateError || !data?.length) return setNotice({ type: "error", text: updateError?.message ?? "The tests were not moved. You may not have permission." });
    const where = [saved.subject.name, kind === "chapter" ? saved.chapter?.name : null].filter(Boolean).join(" > ");
    await logAdminAction({
      action: "edited",
      entityType: "mock_test",
      label: `${plural(data.length, "test")} moved to ${where}`,
      details: { subject_id: saved.subject.id, chapter_id: saved.chapter?.id ?? null, count: data.length },
    });
    setSelected(new Set());
    setMoveFiling(emptyFiling());
    setNotice({ type: "success", text: `Moved ${plural(data.length, "test")} to ${where}.` });
    refresh();
  };

  const card = (test: MockTestRow) => {
    const cutoff = cutoffText(test.cutoff_min === null ? null : Number(test.cutoff_min), test.cutoff_max === null ? null : Number(test.cutoff_max));
    const minus = Number(test.negative_marks);
    return (
      <li key={test.id}>
        <Card>
          <CardContent className="space-y-4 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1.5 size-4 shrink-0 accent-gold-400"
                  checked={selected.has(test.id)}
                  onChange={(e) => toggle([test.id], e.target.checked)}
                  aria-label={`Select ${test.title}`}
                />
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
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/mock-tests/${test.id}/edit`}>
                    Edit<span className="sr-only"> {test.title}</span>
                  </Link>
                </Button>
                <DeleteTests tests={[test]} busy={busy} onConfirm={() => void removeTests([test])} label="Delete" />
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

  /** Select-all, move and delete for the tests shown in the open folder. */
  const toolbar = (shown: MockTestRow[], folderName: string) => {
    const ids = shown.map((t) => t.id);
    const allOn = ids.length > 0 && ids.every((id) => selected.has(id));
    const chosen = shown.filter((t) => selected.has(t.id));
    return (
      <div className="space-y-3 rounded-panel border border-steel-700/60 bg-navy-900 p-4">
        <label className="flex items-center gap-2 text-xs text-steel-300">
          <input type="checkbox" checked={allOn} onChange={(e) => toggle(ids, e.target.checked)} className="size-4 accent-gold-400" />
          Select all {ids.length} in {folderName}. {selected.size > 0 ? `${selected.size} selected.` : "Then move them or delete them."}
        </label>
        {selected.size > 0 ? (
          <div className="space-y-3">
            {kind !== "mock" ? (
              <>
                <FilingFields
                  idPrefix="move-tests"
                  subjects={taxonomy.subjects.filter((x) => x.name !== "Unsorted")}
                  chapters={taxonomy.chapters}
                  value={moveFiling}
                  onChange={setMoveFiling}
                  disabled={busy}
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="gold" size="sm" disabled={busy || !moveFiling.subjectChoice} onClick={() => void moveSelected()}>
                    {busy ? "Working..." : `Move ${plural(selected.size, "test")}`}
                  </Button>
                  <DeleteTests tests={chosen} busy={busy} onConfirm={() => void removeTests(chosen)} label={`Delete ${selected.size} selected`} />
                </div>
              </>
            ) : (
              <DeleteTests tests={chosen} busy={busy} onConfirm={() => void removeTests(chosen)} label={`Delete ${selected.size} selected`} />
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const all = React.useMemo(() => tests ?? [], [tests]);
  const empty = tests !== null && tests.length === 0 && !error;

  // ---- Folder structure -------------------------------------------------
  const subjectFolders = React.useMemo(() => {
    if (kind === "mock") return [];
    const built = buildFolders(all, taxonomy.subjects, taxonomy.chapters).filter((f) => f.count > 0);
    const knownSubjects = new Set(taxonomy.subjects.map((s) => s.id));
    const orphans = all.filter((t) => !t.subject_id || !knownSubjects.has(t.subject_id));
    return { built, orphans };
  }, [all, kind, taxonomy.subjects, taxonomy.chapters]);

  const notice_ = notice ? (
    <Notice kind={notice.type} onClose={() => setNotice(null)} autoHideMs={notice.type === "success" ? 8000 : undefined}>
      {notice.text}
    </Notice>
  ) : null;

  const header = (
    <>
      {notice_}
      {error ? <p role="alert" className="text-xs text-danger-400">Could not load tests: {error}</p> : null}
      {tests === null && !error ? (
        <SkeletonGroup label="Loading tests" className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-panel" />
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
    </>
  );

  if (tests === null || empty) return <div className="space-y-6">{header}</div>;

  // Full mock tests: a folder for each exam.
  if (kind === "mock") {
    const examIds = [...EXAMS, ...new Set(all.map((t) => t.target_exam).filter((e) => !(EXAMS as readonly string[]).includes(e)))];
    const folders = examIds.map((e) => ({ id: e as string, tests: all.filter((t) => t.target_exam === e) })).filter((f) => f.tests.length > 0);
    const open = place.subjectId ? folders.find((f) => f.id === place.subjectId) : undefined;
    return (
      <div className="space-y-6">
        {header}
        {!open ? (
          <ul className="grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
            {folders.map((f) => (
              <li key={f.id}>
                <FolderCard name={f.id} detail={plural(f.tests.length, "test")} onOpen={() => goTo({ subjectId: f.id, chapter: null })} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <BackButton label="All exams" onClick={() => goUp(TOP)} />
              <h2 className="text-lg font-bold text-white">{open.id} full mock tests</h2>
            </div>
            {toolbar(open.tests, open.id)}
            <ul className="space-y-4">{open.tests.map(card)}</ul>
          </div>
        )}
      </div>
    );
  }

  // Subject-wise and chapter-wise: subject folders, then chapters (chapter-wise), then tests.
  const { built, orphans } = subjectFolders as { built: ReturnType<typeof buildFolders>; orphans: MockTestRow[] };
  const folder = place.subjectId && place.subjectId !== OTHER ? built.find((f) => f.subject.id === place.subjectId) : undefined;
  const otherOpen = place.subjectId === OTHER && orphans.length > 0;
  const subjectTests = folder ? all.filter((t) => t.subject_id === folder.subject.id) : otherOpen ? orphans : [];
  const knownChapters = new Set((folder?.chapters ?? []).map((c) => c.id));
  const chapterRows = folder
    ? [
        ...(folder.looseCount > 0 ? [{ id: LOOSE, name: "General", count: folder.looseCount, cover_path: null as string | null }] : []),
        ...folder.chapters.filter((c) => c.count > 0),
      ]
    : [];
  const chapterRow = kind === "chapter" && place.chapter ? chapterRows.find((c) => c.id === place.chapter) : undefined;
  const openName = folder?.subject.name ?? "Other";

  const testsHere = (): MockTestRow[] =>
    chapterRow && folder
      ? subjectTests.filter((t) => (chapterRow.id === LOOSE ? !t.chapter_id || !knownChapters.has(t.chapter_id) : t.chapter_id === chapterRow.id))
      : subjectTests;

  return (
    <div className="space-y-6">
      {header}
      {!folder && !otherOpen ? (
        <ul className="grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
          {built.map((f) => (
            <li key={f.subject.id}>
              <FolderCard
                name={f.subject.name}
                cover={f.subject.cover_path}
                detail={kind === "chapter" ? `${plural(f.chapters.filter((c) => c.count > 0).length + (f.looseCount > 0 ? 1 : 0), "chapter")}, ${plural(f.count, "test")}` : plural(f.count, "test")}
                onOpen={() => goTo({ subjectId: f.subject.id, chapter: null })}
              />
            </li>
          ))}
          {orphans.length > 0 ? (
            <li>
              <FolderCard name="Other" detail={`${plural(orphans.length, "test")}, not in a subject`} onOpen={() => goTo({ subjectId: OTHER, chapter: null })} />
            </li>
          ) : null}
        </ul>
      ) : null}

      {(folder || otherOpen) && kind === "chapter" && !chapterRow && folder ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton label="All subjects" onClick={() => goUp(TOP)} />
            <h2 className="text-lg font-bold text-white">{openName}</h2>
          </div>
          <ul className="grid list-none gap-3 p-0 md:grid-cols-2">
            {chapterRows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => goTo({ subjectId: folder.subject.id, chapter: row.id })}
                  className="flex w-full items-center justify-between gap-3 rounded-panel border border-steel-700/60 bg-navy-900 px-4 py-3 text-left transition-colors hover:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <ChapterThumb path={row.cover_path} />
                    <span className="min-w-0 truncate text-sm font-semibold text-white">{row.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-steel-300">
                    {plural(row.count, "test")}
                    <Icons.chevronRight className="size-4" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {((folder || otherOpen) && kind === "subject") || (kind === "chapter" && (chapterRow || otherOpen)) ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton
              label={kind === "chapter" && chapterRow && folder ? folder.subject.name : "All subjects"}
              onClick={() => (kind === "chapter" && chapterRow && folder ? goUp({ subjectId: folder.subject.id, chapter: null }) : goUp(TOP))}
            />
            <h2 className="text-lg font-bold text-white">
              {openName}
              {chapterRow ? (
                <>
                  {" "}
                  <span className="text-steel-500">/</span> {chapterRow.name}
                </>
              ) : null}
            </h2>
          </div>
          {toolbar(testsHere(), chapterRow?.name ?? openName)}
          <ul className="space-y-4">{testsHere().map(card)}</ul>
        </div>
      ) : null}
    </div>
  );
}

/** A delete button with a confirmation that says how many tests go. */
function DeleteTests({ tests, busy, onConfirm, label }: { tests: MockTestRow[]; busy: boolean; onConfirm: () => void; label: string }) {
  const one = tests.length === 1;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={tests.length > 1 || label !== "Delete" ? "danger" : "outline"} size="sm" disabled={busy || tests.length === 0} aria-label={one ? `Delete ${tests[0].title}` : label}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent tone="danger">
        <AlertDialogHeader>
          <AlertDialogTitle>{one ? "Delete this test?" : `Delete ${tests.length} tests?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {one ? `"${tests[0].title}" disappears` : `These ${tests.length} tests disappear`} from the cadet Test Center, together with the questions you added to {one ? "it" : "them"} and the saved PDF.
            Questions from the shared bank stay. Students&apos; past results are kept. The action is saved in the audit log.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep {one ? "it" : "them"}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{one ? "Delete test" : `Delete ${tests.length} tests`}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
