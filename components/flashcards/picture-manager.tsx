"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamPicker } from "@/components/admin/exam-picker";
import { emptyFiling, FilingFields } from "@/components/admin/filing-fields";
import { checkFiling, NEW_SUBJECT, type FilingInput } from "@/lib/filing";
import { saveFiling } from "@/lib/filing-save";
import { Icons } from "@/components/ui/icons";
import { pictureUrl } from "@/components/flashcards/picture-url";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { logAdminAction } from "@/lib/adminLog";
import { FLASHCARD_BUCKET, UPLOAD_ACCEPT, IMAGE_COLUMNS, imagePath, imageProblem, type FlashcardImage } from "@/lib/flashcard-images";
import { supabase } from "@/lib/supabaseClient";
import { isPdf, pageCountProblem, pageCreatedAt, pagePicturePath, pdfProblem, sourcePdfPath } from "@/lib/pdf-upload";
import { openPdf } from "@/lib/pdf-render";
import { cleanExams, type ExamId } from "@/lib/subjects";
import { buildFolders } from "@/lib/taxonomy";
import { BackButton, ChapterThumb, plural, SubjectFolderCard } from "@/components/vault/folder-parts";
import { useStepState } from "@/hooks/use-step-state";
import { Notice } from "@/components/ui/notice";

const LOOSE = "loose";

/** Where the admin is in the folders: nothing open, a subject, or a chapter (LOOSE for cards with no chapter). */
interface Place {
  subjectId: string | null;
  chapter: string | null;
}
const TOP: Place = { subjectId: null, chapter: null };

type Message = { type: "success" | "error"; text: string } | null;
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-steel-300";

/** Admin: pick a subject and chapter, choose pictures, upload. Below it, every picture with a delete button. */
export function PictureManager() {
  const [pictures, setPictures] = React.useState<FlashcardImage[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [filing, setFiling] = React.useState<FilingInput>(emptyFiling());
  const [exams, setExams] = React.useState<ExamId[]>([]);
  const [place, pushPlace, upPlace] = useStepState<Place>(TOP, "admin-pictures");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [moveFiling, setMoveFiling] = React.useState<FilingInput>(emptyFiling());
  const [moveExams, setMoveExams] = React.useState<ExamId[]>([]);
  const [moving, setMoving] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [progress, setProgress] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<Message>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [version2, setVersion2] = React.useState(0);
  const taxonomy = useTaxonomy(version2);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("flashcard_images")
      .select(IMAGE_COLUMNS)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) return setLoadError(error.message);
        setLoadError(null);
        setPictures((data ?? []) as FlashcardImage[]);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const refresh = () => {
    setVersion((v) => v + 1);
    setVersion2((v) => v + 1);
  };
  const uploading = progress !== null;

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const bad = picked.map((f) => (isPdf(f) ? pdfProblem(f) : imageProblem(f))).find(Boolean);
    if (bad) {
      setFiles([]);
      e.target.value = "";
      return setMsg({ type: "error", text: bad });
    }
    setMsg(null);
    setFiles(picked);
  };

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (files.length === 0) return setMsg({ type: "error", text: "Choose at least one picture." });
    const check = checkFiling(filing, taxonomy.subjects, taxonomy.chapters);
    if (!check.ok) return setMsg({ type: "error", text: check.error });
    setProgress("Preparing the subject and chapter...");
    const saved = await saveFiling(check, exams);
    if (!saved.ok) {
      setProgress(null);
      return setMsg({ type: "error", text: saved.error });
    }
    const { subject, chapter } = saved;
    if (saved.created.length > 0) refresh();

    let added = 0;
    const failed: string[] = [];
    const base = { subject_id: subject.id, chapter_id: chapter?.id ?? null, exams };

    /** One PDF: the original is stored once, then every page becomes a flashcard picture. */
    const addPdf = async (file: File, label: string) => {
      setProgress(`${label}Reading ${file.name}...`);
      let pdf;
      try {
        pdf = await openPdf(file);
      } catch {
        return failed.push(`${file.name}: this PDF could not be read. It may be damaged or password protected.`);
      }
      const tooMany = pageCountProblem(file.name, pdf.numPages);
      if (tooMany) {
        await pdf.close();
        return failed.push(tooMany);
      }
      const pdfPath = sourcePdfPath(crypto.randomUUID(), file.name);
      const storedPdf = await supabase.storage.from(FLASHCARD_BUCKET).upload(pdfPath, file, { contentType: "application/pdf", upsert: false });
      if (storedPdf.error) {
        await pdf.close();
        return failed.push(`${file.name}: ${storedPdf.error.message}`);
      }
      const startedAt = Date.now();
      let pagesAdded = 0;
      for (let page = 1; page <= pdf.numPages; page += 1) {
        setProgress(`${label}${file.name}: page ${page} of ${pdf.numPages}...`);
        const path = pagePicturePath(crypto.randomUUID(), page);
        try {
          const blob = await pdf.renderPage(page);
          const stored = await supabase.storage.from(FLASHCARD_BUCKET).upload(path, blob, { contentType: "image/jpeg", upsert: false });
          if (stored.error) throw new Error(stored.error.message);
          const { error } = await supabase
            .from("flashcard_images")
            .insert({ ...base, image_path: path, source_pdf: pdfPath, source_page: page, source_name: file.name, created_at: pageCreatedAt(startedAt, page) });
          if (error) {
            await supabase.storage.from(FLASHCARD_BUCKET).remove([path]);
            throw new Error(error.message);
          }
          pagesAdded += 1;
        } catch (err) {
          failed.push(`${file.name} page ${page}: ${err instanceof Error ? err.message : "failed"}`);
        }
      }
      await pdf.close();
      // No page made it, so the stored original would be an orphan.
      if (pagesAdded === 0) await supabase.storage.from(FLASHCARD_BUCKET).remove([pdfPath]);
      added += pagesAdded;
    };

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const label = files.length > 1 ? `File ${i + 1} of ${files.length}: ` : "";
      if (isPdf(file)) {
        await addPdf(file, label);
        continue;
      }
      setProgress(`${label}Uploading ${file.name}...`);
      const path = imagePath(file, crypto.randomUUID());
      const stored = await supabase.storage.from(FLASHCARD_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
      if (stored.error) {
        failed.push(`${file.name}: ${stored.error.message}`);
        continue;
      }
      const { error } = await supabase.from("flashcard_images").insert({ ...base, image_path: path });
      if (error) {
        // Do not leave a picture in storage that no student can see.
        await supabase.storage.from(FLASHCARD_BUCKET).remove([path]);
        failed.push(`${file.name}: ${error.message}`);
        continue;
      }
      added += 1;
    }
    setProgress(null);

    if (added > 0) {
      await logAdminAction({
        action: "added",
        entityType: "flashcard_image",
        label: `${added} ${added === 1 ? "picture" : "pictures"} in ${[subject.name, chapter?.name].filter(Boolean).join(" > ")}`,
        details: { subject_id: subject.id, chapter_id: chapter?.id ?? null, count: added, exams },
      });
      setFiles([]);
      setFiling((f) => (f.subjectChoice === NEW_SUBJECT ? emptyFiling() : f));
      if (fileInput.current) fileInput.current.value = "";
      refresh();
      // Show the folder the pictures went into, so it is clear where they landed.
      pushPlace({ subjectId: subject.id, chapter: chapter?.id ?? LOOSE });
    }
    if (failed.length > 0) {
      setMsg({ type: "error", text: `${added > 0 ? `Added ${added}, but ` : ""}${failed.length} could not be uploaded. ${failed[0]}` });
    } else {
      setMsg({ type: "success", text: `Added ${added} ${added === 1 ? "picture" : "pictures"} to ${[subject.name, chapter?.name].filter(Boolean).join(" > ")}.` });
    }
  };

  const remove = async (item: FlashcardImage) => {
    if (!window.confirm("Delete this picture? Students will no longer see it.")) return;
    setBusyId(item.id);
    setMsg(null);
    const { data, error } = await supabase.from("flashcard_images").delete().eq("id", item.id).select("id");
    if (error || !data?.length) {
      setBusyId(null);
      return setMsg({ type: "error", text: error?.message ?? "Could not delete the picture." });
    }
    // Keep the original PDF while other pages of it are still on show.
    const stillUsed = item.source_pdf ? (pictures ?? []).some((p) => p.id !== item.id && p.source_pdf === item.source_pdf) : false;
    const removed = await supabase.storage.from(FLASHCARD_BUCKET).remove(item.source_pdf && !stillUsed ? [item.image_path, item.source_pdf] : [item.image_path]);
    setBusyId(null);
    await logAdminAction({ action: "deleted", entityType: "flashcard_image", label: item.image_path, details: { image_id: item.id, file_left_in_storage: Boolean(removed.error) } });
    setMsg(
      removed.error
        ? { type: "error", text: "The picture was removed from the Flashcards page, but its file could not be deleted from storage." }
        : { type: "success", text: "Picture deleted." },
    );
    refresh();
  };

  const toggleSelected = (ids: string[], on: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  /** Moves the ticked pictures to another subject and chapter. Their file and exam tags stay as they are. */
  const move = async () => {
    const check = checkFiling(moveFiling, taxonomy.subjects, taxonomy.chapters);
    if (!check.ok) return setMsg({ type: "error", text: check.error });
    const ids = [...selected];
    setMoving(true);
    setMsg(null);
    const saved = await saveFiling(check, moveExams);
    if (!saved.ok) {
      setMoving(false);
      return setMsg({ type: "error", text: saved.error });
    }
    const target = saved.subject;
    const targetChapter = saved.chapter;
    const { data, error } = await supabase
      .from("flashcard_images")
      .update({ subject_id: target.id, chapter_id: targetChapter?.id ?? null })
      .in("id", ids)
      .select("id");
    setMoving(false);
    if (error || !data?.length) return setMsg({ type: "error", text: error?.message ?? "The pictures were not moved. You may not have permission." });
    await logAdminAction({
      action: "edited",
      entityType: "flashcard_image",
      label: `${data.length} ${data.length === 1 ? "picture" : "pictures"} moved to ${[target.name, targetChapter?.name].filter(Boolean).join(" > ")}`,
      details: { subject_id: target.id, chapter_id: targetChapter?.id ?? null, count: data.length },
    });
    setSelected(new Set());
    setMoveFiling(emptyFiling());
    setMsg({ type: "success", text: `Moved ${data.length} ${data.length === 1 ? "picture" : "pictures"} to ${[target.name, targetChapter?.name].filter(Boolean).join(" > ")}.` });
    refresh();
  };

  /** Deletes the ticked pictures and their stored files. A PDF's original goes too once none of its pages is left. */
  const removeSelected = async () => {
    const targets = (pictures ?? []).filter((p) => selected.has(p.id));
    if (targets.length === 0) return;
    if (!window.confirm(`Delete ${targets.length} ${targets.length === 1 ? "picture" : "pictures"}? Students will no longer see ${targets.length === 1 ? "it" : "them"}.`)) return;
    setMoving(true);
    setMsg(null);
    const { data, error } = await supabase.from("flashcard_images").delete().in("id", targets.map((t) => t.id)).select("id");
    if (error || !data?.length) {
      setMoving(false);
      return setMsg({ type: "error", text: error?.message ?? "The pictures were not deleted. You may not have permission." });
    }
    const gone = new Set(data.map((d) => d.id as string));
    const deleted = targets.filter((t) => gone.has(t.id));
    const remaining = (pictures ?? []).filter((p) => !gone.has(p.id));
    const orphanPdfs = [...new Set(deleted.map((d) => d.source_pdf).filter((p): p is string => Boolean(p)))].filter((pdf) => !remaining.some((r) => r.source_pdf === pdf));
    const removed = await supabase.storage.from(FLASHCARD_BUCKET).remove([...deleted.map((d) => d.image_path), ...orphanPdfs]);
    await logAdminAction({ action: "deleted", entityType: "flashcard_image", label: `${deleted.length} ${deleted.length === 1 ? "picture" : "pictures"}`, details: { image_ids: deleted.map((d) => d.id), file_left_in_storage: Boolean(removed.error) } });
    setMoving(false);
    setSelected(new Set());
    setMsg(
      removed.error || deleted.length < targets.length
        ? { type: "error", text: `Deleted ${deleted.length}.${deleted.length < targets.length ? ` ${targets.length - deleted.length} could not be deleted.` : ""}${removed.error ? " Some stored files could not be removed from storage." : ""}` }
        : { type: "success", text: `Deleted ${deleted.length} ${deleted.length === 1 ? "picture" : "pictures"}.` },
    );
    refresh();
  };

  /** Replaces the exam tags of the ticked pictures. */
  const applyExams = async () => {
    const ids = [...selected];
    setMoving(true);
    setMsg(null);
    const { data, error } = await supabase.from("flashcard_images").update({ exams: moveExams }).in("id", ids).select("id");
    setMoving(false);
    if (error || !data?.length) return setMsg({ type: "error", text: error?.message ?? "The exams were not changed. You may not have permission." });
    await logAdminAction({
      action: "edited",
      entityType: "flashcard_image",
      label: `Exams set on ${data.length} ${data.length === 1 ? "picture" : "pictures"}`,
      details: { count: data.length, exams: moveExams },
    });
    setSelected(new Set());
    setMsg({ type: "success", text: moveExams.length > 0 ? `Tagged ${data.length} ${data.length === 1 ? "picture" : "pictures"} for ${moveExams.join(", ").toUpperCase()}.` : `Cleared the exam tags on ${data.length} ${data.length === 1 ? "picture" : "pictures"}.` });
    refresh();
  };

  // Only subjects that hold pictures are shown as folders. Empty ones are managed on the Subjects page.
  const folders = React.useMemo(() => buildFolders(pictures ?? [], taxonomy.subjects, taxonomy.chapters).filter((f) => f.count > 0), [pictures, taxonomy.subjects, taxonomy.chapters]);
  const folder = place.subjectId ? folders.find((f) => f.subject.id === place.subjectId) : undefined;
  const chapterRows = folder ? [...(folder.looseCount > 0 ? [{ id: LOOSE, name: "General", count: folder.looseCount, cover_path: null as string | null }] : []), ...folder.chapters.filter((c) => c.count > 0)] : [];
  const chapterId = folder && place.chapter ? place.chapter : null;
  const chapterRow = chapterId ? chapterRows.find((c) => c.id === chapterId) : undefined;
  // Plain computation (no memo): the list is small and the compiler caches it.
  const knownChapters = new Set((folder?.chapters ?? []).map((c) => c.id));
  const chapterItems = !folder || !chapterRow
    ? []
    : (pictures ?? [])
        .filter((p) => p.subject_id === folder.subject.id && (chapterRow.id === LOOSE ? !p.chapter_id || !knownChapters.has(p.chapter_id) : p.chapter_id === chapterRow.id))
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const goTo = (next: Place) => {
    pushPlace(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
  const goUp = (next: Place) => {
    upPlace(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  return (
    <div className="space-y-8">
      {msg ? (
        <Notice kind={msg.type} reveal={false} onClose={() => setMsg(null)} autoHideMs={msg.type === "success" ? 8000 : undefined}>{msg.text}</Notice>
      ) : null}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Add Pictures or a PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={upload} className="space-y-4">
            <FilingFields
              idPrefix="pic"
              subjects={taxonomy.subjects}
              chapters={taxonomy.chapters}
              value={filing}
              onChange={setFiling}
              // The subject's own exams are the starting point. Change them freely.
              onSubjectPicked={(subject) => setExams(cleanExams(subject?.exams))}
              disabled={uploading}
            />

            <ExamPicker value={exams} onChange={setExams} hint="Tick the exams these cards are for, and they show in those exam folders too. Leave all unticked if they are for everyone." />

            <div className="space-y-1">
              <label htmlFor="pic-files" className={labelClass}>Pictures or PDFs</label>
              <input
                id="pic-files"
                ref={fileInput}
                type="file"
                multiple
                accept={UPLOAD_ACCEPT}
                onChange={pick}
                className="block w-full text-sm text-steel-300 file:mr-3 file:rounded-control file:border file:border-steel-700 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-steel-100"
              />
              <p className="text-xs text-steel-500">PNG, JPG, WebP or PDF. Each picture is a flashcard. A PDF is turned into one flashcard per page (up to 80 pages, 50 MB), and students can also download the whole PDF.{files.length > 0 ? ` ${files.length} selected.` : ""}</p>
            </div>

            <Button type="submit" variant="gold" disabled={uploading || !filing.subjectChoice || files.length === 0}>
              {uploading ? progress : files.length > 1 ? `Add ${files.length} files` : files.length === 1 && isPdf(files[0]) ? "Add PDF as flashcards" : "Add picture"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Pictures</CardTitle>
          {pictures ? <Badge variant="outline">{pictures.length} total</Badge> : null}
        </CardHeader>
        <CardContent className="space-y-8">
          {selected.size > 0 ? (
            <div role="region" aria-label="Selected pictures" className="sticky top-2 z-10 space-y-4 rounded-panel border border-gold-400/60 bg-navy-900 p-4 shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-white">{selected.size} selected</p>
                <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Clear selection</Button>
              </div>
              <FilingFields idPrefix="move" subjects={taxonomy.subjects.filter((x) => x.name !== "Unsorted")} chapters={taxonomy.chapters} value={moveFiling} onChange={setMoveFiling} disabled={moving} />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="gold" className="w-full sm:w-auto" disabled={moving || !moveFiling.subjectChoice} onClick={() => void move()}>
                  {moving ? "Working..." : "Move selected"}
                </Button>
                <Button variant="danger" className="w-full sm:w-auto" disabled={moving} onClick={() => void removeSelected()}>
                  Delete selected ({selected.size})
                </Button>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-steel-700/60 pt-3">
                <ExamPicker legend="Set exams on the selected pictures" value={moveExams} onChange={setMoveExams} />
                <Button variant="outline" size="sm" disabled={moving} onClick={() => void applyExams()}>Apply exams</Button>
              </div>
            </div>
          ) : null}
          {loadError ? <Notice kind="error" reveal={false} title="Could not load">Could not load pictures: {loadError}. Have you run migration 014?</Notice> : null}
          {!pictures && !loadError ? <p className="text-xs text-steel-300">Loading pictures...</p> : null}
          {pictures && pictures.length === 0 ? <p className="text-xs text-steel-300">No pictures yet. Add the first ones above.</p> : null}
          {pictures && pictures.length > 0 && !folder ? (
            <ul className="grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
              {folders.map((f) => (
                <li key={f.subject.id}>
                  <SubjectFolderCard folder={f} onOpen={() => goTo({ subjectId: f.subject.id, chapter: null })} />
                </li>
              ))}
            </ul>
          ) : null}
          {folder && !chapterRow ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <BackButton label="All folders" onClick={() => goUp(TOP)} />
                <h3 className="text-lg font-bold text-white">{folder.subject.name}</h3>
              </div>
              <ul className="grid list-none gap-3 p-0 md:grid-cols-2">
                {chapterRows.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => goTo({ subjectId: folder.subject.id, chapter: row.id })}
                      className="flex w-full items-center justify-between gap-3 rounded-panel border border-steel-700/60 bg-navy-900 px-4 py-3 text-left transition-colors hover:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <ChapterThumb path={row.cover_path} />
                        <span className="min-w-0 truncate text-sm font-semibold text-white">{row.name}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-steel-300">
                        {plural(row.count, "card")}
                        <Icons.chevronRight className="size-4" aria-hidden />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {folder && chapterRow ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <BackButton label={folder.subject.name} onClick={() => goUp({ subjectId: folder.subject.id, chapter: null })} />
                <h3 className="text-lg font-bold text-white">
                  {folder.subject.name} <span className="text-steel-500">/</span> {chapterRow.name}
                </h3>
              </div>
              {(() => {
                const groupIds = chapterItems.map((i) => i.id);
                const allOn = groupIds.length > 0 && groupIds.every((id) => selected.has(id));
                return (
                  <label className="flex items-center gap-2 text-xs text-steel-300">
                    <input type="checkbox" checked={allOn} onChange={(e) => toggleSelected(groupIds, e.target.checked)} className="size-4 accent-gold-400" />
                    Select all {groupIds.length} in {chapterRow.name}. Then move them, tag exams, or delete them above.
                  </label>
                );
              })()}
              <ul className="grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4">
                {chapterItems.map((item) => (
                  <li key={item.id} className="overflow-hidden rounded-control border border-steel-700/60 bg-navy-950">
                    <div className="aspect-4/3 w-full bg-navy-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pictureUrl(item.image_path)} alt={`Flashcard in ${chapterRow.name}`} loading="lazy" className="size-full object-contain" />
                    </div>
                    <div className="space-y-2 p-2">
                      <label className="flex items-center gap-2 text-xs text-steel-300">
                        <input type="checkbox" checked={selected.has(item.id)} onChange={(e) => toggleSelected([item.id], e.target.checked)} className="size-4 accent-gold-400" />
                        Select
                        {item.exams?.length ? <span className="ml-auto font-mono text-xs text-gold-300">{item.exams.join(", ").toUpperCase()}</span> : null}
                      </label>
                      <Button variant="danger" size="sm" className="w-full" disabled={busyId === item.id} onClick={() => void remove(item)} aria-label={`Delete picture in ${chapterRow.name}`}>
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
