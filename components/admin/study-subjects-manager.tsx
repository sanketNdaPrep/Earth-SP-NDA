"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { ChaptersManager } from "@/components/admin/chapters-manager";
import { logAdminAction } from "@/lib/adminLog";
import { removeCovers } from "@/lib/cover-upload";
import { countFiled } from "@/lib/usage-check";
import { blockedMessage, splitDeletable } from "@/lib/usage";
import { IMAGE_ACCEPT, imageProblem } from "@/lib/flashcard-images";
import { cleanExams, coverPath, EXAMS, slugify, SUBJECT_COVER_BUCKET, type ExamId, type Subject } from "@/lib/subjects";
import { supabase } from "@/lib/supabaseClient";

type Message = { type: "success" | "error"; text: string } | null;
type Row = Pick<Subject, "id" | "name" | "slug" | "is_active" | "sort_order" | "cover_path" | "exams">;

const inputClass =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-steel-300";

function coverUrl(path: string): string {
  return supabase.storage.from(SUBJECT_COVER_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Study subjects (Mathematics, Biology...) for flashcards and study files. Admins add subjects by hand,
 * tag the exams that use them (optional), set a cover picture and add chapters by hand.
 */
export function StudySubjectsManager() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [name, setName] = React.useState("");
  const [exams, setExams] = React.useState<ExamId[]>([]);
  const [cover, setCover] = React.useState<File | null>(null);
  const [removeCover, setRemoveCover] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [ticked, setTicked] = React.useState<Set<string>>(new Set());
  const [chaptersOpen, setChaptersOpen] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<Message>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("subjects")
      .select("id, name, slug, is_active, sort_order, cover_path, exams")
      .eq("kind", "subject")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) return setLoadError(error.message);
        setLoadError(null);
        setRows((data ?? []) as unknown as Row[]);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const refresh = () => setVersion((v) => v + 1);
  const toggleExam = (id: ExamId) => setExams((list) => (list.includes(id) ? list.filter((x) => x !== id) : cleanExams([...list, id])));

  const reset = () => {
    setEditing(null);
    setName("");
    setExams([]);
    setCover(null);
    setRemoveCover(false);
    if (fileInput.current) fileInput.current.value = "";
  };

  const startEdit = (row: Row) => {
    setEditing(row);
    setName(row.name);
    setExams(cleanExams(row.exams));
    setCover(null);
    setRemoveCover(false);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    const bad = file ? imageProblem(file) : null;
    if (bad) {
      e.target.value = "";
      setCover(null);
      return setMsg({ type: "error", text: bad });
    }
    setMsg(null);
    setCover(file);
    setRemoveCover(false);
  };

  const uploadCover = async (file: File): Promise<{ path: string } | { error: string }> => {
    const path = coverPath(file, crypto.randomUUID());
    const { error } = await supabase.storage.from(SUBJECT_COVER_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    return error ? { error: error.message } : { path };
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const clean = name.trim();
    if (clean.length < 2 || clean.length > 60) return setMsg({ type: "error", text: "Name must be 2 to 60 characters." });
    const slug = slugify(clean);
    if (!slug) return setMsg({ type: "error", text: "Use letters or numbers in the name." });

    setSaving(true);
    let nextCover: string | null | undefined; // undefined: leave as it is
    if (cover) {
      const result = await uploadCover(cover);
      if ("error" in result) {
        setSaving(false);
        return setMsg({ type: "error", text: `The picture could not be uploaded: ${result.error}` });
      }
      nextCover = result.path;
    } else if (removeCover) {
      nextCover = null;
    }

    if (!editing) {
      const last = (rows ?? []).reduce((max, r) => Math.max(max, r.sort_order < 900 ? r.sort_order : 0), 0);
      const { data, error } = await supabase
        .from("subjects")
        .insert({ name: clean, slug, kind: "subject", description: "", icon_name: "book", is_active: true, sort_order: last + 10, exams, cover_path: nextCover ?? null })
        .select("id");
      if (error || !data?.length) {
        if (typeof nextCover === "string") await supabase.storage.from(SUBJECT_COVER_BUCKET).remove([nextCover]);
        setSaving(false);
        return setMsg({ type: "error", text: error?.code === "23505" ? "A subject with this name already exists." : (error?.message ?? "Could not add the subject.") });
      }
      await logAdminAction({ action: "added", entityType: "subject", label: clean, details: { subject_id: data[0].id, exams } });
      setSaving(false);
      setMsg({ type: "success", text: `Added "${clean}". Add its chapters with the Chapters button.` });
      reset();
      return refresh();
    }

    const update: Record<string, unknown> = { name: clean, exams };
    if (nextCover !== undefined) update.cover_path = nextCover;
    const { data, error } = await supabase.from("subjects").update(update).eq("id", editing.id).select("id");
    if (error || !data?.length) {
      if (typeof nextCover === "string") await supabase.storage.from(SUBJECT_COVER_BUCKET).remove([nextCover]);
      setSaving(false);
      return setMsg({ type: "error", text: error?.message ?? "Could not save the changes." });
    }
    // The old picture is only removed once the new state is saved.
    if (nextCover !== undefined && editing.cover_path) await supabase.storage.from(SUBJECT_COVER_BUCKET).remove([editing.cover_path]);
    await logAdminAction({ action: "edited", entityType: "subject", label: clean, details: { subject_id: editing.id, exams, cover_changed: nextCover !== undefined } });
    setSaving(false);
    setMsg({ type: "success", text: `Saved "${clean}".` });
    reset();
    refresh();
  };

  const toggleActive = async (row: Row) => {
    setBusyId(row.id);
    setMsg(null);
    const next = !row.is_active;
    const { data, error } = await supabase.from("subjects").update({ is_active: next }).eq("id", row.id).select("id");
    setBusyId(null);
    if (error || !data?.length) return setMsg({ type: "error", text: error?.message ?? "Could not change the status." });
    await logAdminAction({ action: next ? "activated" : "deactivated", entityType: "subject", label: row.name, details: { subject_id: row.id } });
    setMsg({ type: "success", text: next ? `"${row.name}" is shown to students.` : `"${row.name}" is hidden from students. Nothing was deleted.` });
    refresh();
  };

  /** Deletes subjects that hold nothing. Their empty chapters and cover pictures go with them. */
  const removeMany = async (targets: Row[]) => {
    if (targets.length === 0) return;
    setBusyId("bulk");
    setMsg(null);
    let usage: Record<string, number>;
    try {
      usage = await countFiled("subject_id", targets.map((t) => t.id));
    } catch (err) {
      setBusyId(null);
      return setMsg({ type: "error", text: err instanceof Error ? err.message : "Could not check what is inside." });
    }
    const { free, busy: blocked } = splitDeletable(targets.map((t) => t.id), usage);
    const blockedNames = targets.filter((t) => blocked.includes(t.id)).map((t) => t.name);
    if (free.length === 0) {
      setBusyId(null);
      return setMsg({ type: "error", text: blockedMessage("subject", blockedNames) });
    }
    const doomed = targets.filter((t) => free.includes(t.id));
    const sure = window.confirm(
      `Delete ${doomed.length === 1 ? `the subject "${doomed[0].name}"` : `${doomed.length} subjects (${doomed.slice(0, 3).map((d) => d.name).join(", ")}${doomed.length > 3 ? ", ..." : ""})`} and its empty chapters?`,
    );
    if (!sure) return setBusyId(null);
    const chapterCovers = await supabase.from("chapters").select("cover_path").in("subject_id", free);
    const { data, error } = await supabase.from("subjects").delete().in("id", free).select("id");
    setBusyId(null);
    if (error || !data?.length) return setMsg({ type: "error", text: error?.message ?? "Could not delete the subjects." });
    await removeCovers([...doomed.map((d) => d.cover_path), ...((chapterCovers.data ?? []) as { cover_path: string | null }[]).map((c) => c.cover_path)]);
    await logAdminAction({ action: "deleted", entityType: "subject", label: doomed.length === 1 ? doomed[0].name : `${doomed.length} subjects`, details: { subjects: doomed.map((d) => d.name) } });
    setTicked(new Set());
    setMsg({ type: "success", text: `Deleted ${data.length} ${data.length === 1 ? "subject" : "subjects"}.${blockedNames.length > 0 ? ` Kept ${blockedNames.length} that still hold content: ${blockedNames.join(", ")}.` : ""}` });
    refresh();
  };

  const toggleTick = (id: string, on: boolean) =>
    setTicked((cur) => {
      const next = new Set(cur);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div className="space-y-8 border-t border-steel-700/60 pt-8">
      <div>
        <Badge variant="gold" className="mb-2">Flashcards and Study Files</Badge>
        <h2 className="text-2xl font-bold tracking-tight text-white">Study Subjects</h2>
        <p className="mt-1 max-w-2xl text-sm text-steel-300">
          The subjects students browse, such as Mathematics or Biology. Add a subject, tag the exams that use it if you want to, give it a cover picture, then add its chapters.
        </p>
      </div>

      {msg ? (
        <div
          role={msg.type === "error" ? "alert" : "status"}
          className={`flex max-w-3xl items-start gap-2 rounded-control border p-3 text-xs ${
            msg.type === "success" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-danger-500/40 bg-danger-500/10 text-danger-400"
          }`}
        >
          {msg.type === "success" ? <Icons.checkCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Icons.info className="mt-0.5 size-4 shrink-0" aria-hidden />}
          <span>{msg.text}</span>
        </div>
      ) : null}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">{editing ? `Edit: ${editing.name}` : "Add Study Subject"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="study-subject-name" className={labelClass}>Name</label>
              <input id="study-subject-name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Biology" className={inputClass} />
            </div>

            <fieldset className="space-y-2">
              <legend className={labelClass}>Exams (optional)</legend>
              <div className="flex flex-wrap gap-4">
                {EXAMS.map((exam) => (
                  <label key={exam.id} className="flex items-center gap-2 text-sm text-steel-100">
                    <input type="checkbox" checked={exams.includes(exam.id)} onChange={() => toggleExam(exam.id)} className="size-4 accent-gold-400" />
                    {exam.name}
                  </label>
                ))}
              </div>
              <p className="text-xs text-steel-500">Tick the exams that include this subject. Leave all unticked if it is not tied to one exam.</p>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="study-subject-cover" className={labelClass}>Cover picture (optional)</label>
              {editing?.cover_path && !removeCover && !cover ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl(editing.cover_path)} alt={`Current cover of ${editing.name}`} className="size-16 rounded-control border border-steel-700 object-cover" />
                  <Button type="button" variant="outline" size="sm" onClick={() => setRemoveCover(true)}>Remove picture</Button>
                </div>
              ) : null}
              {removeCover ? <p className="text-xs text-steel-300">The picture will be removed when you save.</p> : null}
              <input
                id="study-subject-cover"
                ref={fileInput}
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={pickCover}
                className="block w-full text-sm text-steel-300 file:mr-3 file:rounded-control file:border file:border-steel-700 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-steel-100"
              />
              <p className="text-xs text-steel-500">PNG, JPG or WebP. It shows on the subject folder.{editing ? " Choose a new one to replace the current picture." : ""}</p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="gold" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Add subject"}
              </Button>
              {editing ? <Button type="button" variant="outline" onClick={reset}>Cancel</Button> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Study Subjects</CardTitle>
          {rows ? <Badge variant="outline">{rows.length} total</Badge> : null}
        </CardHeader>
        <CardContent>
          {loadError ? <p role="alert" className="text-xs text-danger-400">Could not load subjects: {loadError}. Have you run migration 015?</p> : null}
          {!rows && !loadError ? <p className="text-xs text-steel-300">Loading subjects...</p> : null}
          {rows && rows.length === 0 ? <p className="text-xs text-steel-300">No study subjects yet. Add the first one above.</p> : null}
          {rows && rows.length > 0 ? (
            <>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs text-steel-300">
                <input type="checkbox" className="size-4 accent-gold-400" checked={rows.length > 0 && rows.every((x) => ticked.has(x.id))} onChange={(e) => setTicked(e.target.checked ? new Set(rows.map((x) => x.id)) : new Set())} />
                Select all {rows.length} subjects
              </label>
              {ticked.size > 0 ? (
                <Button type="button" size="sm" variant="danger" disabled={busyId === "bulk"} onClick={() => void removeMany(rows.filter((x) => ticked.has(x.id)))}>
                  Delete selected ({ticked.size})
                </Button>
              ) : null}
            </div>
            <ul className="divide-y divide-steel-700/50">
              {rows.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <input type="checkbox" className="size-4 shrink-0 accent-gold-400" checked={ticked.has(r.id)} onChange={(e) => toggleTick(r.id, e.target.checked)} aria-label={`Select ${r.name}`} />
                    {r.cover_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverUrl(r.cover_path)} alt="" className="size-12 shrink-0 rounded-control border border-steel-700 object-cover" />
                    ) : (
                      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-control border border-steel-700 bg-navy-950 text-gold-400">
                        <Icons.book className="size-5" aria-hidden />
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-white">{r.name}</div>
                      <p className="mt-0.5 text-xs text-steel-300">
                        {cleanExams(r.exams).length > 0 ? cleanExams(r.exams).map((id) => EXAMS.find((e) => e.id === id)?.name).join(", ") : "Not tied to an exam"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={r.is_active ? "emerald" : "outline"}>{r.is_active ? "Shown" : "Hidden"}</Badge>
                    <Button variant="outline" size="sm" aria-expanded={chaptersOpen === r.id} onClick={() => setChaptersOpen(chaptersOpen === r.id ? null : r.id)} aria-label={`Chapters of ${r.name}`}>
                      Chapters
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => startEdit(r)} aria-label={`Edit ${r.name}`}>Edit</Button>
                    <Button variant="outline" size="sm" disabled={busyId === r.id} onClick={() => void toggleActive(r)} aria-label={`${r.is_active ? "Hide" : "Show"} ${r.name} for students`}>
                      {r.is_active ? "Hide" : "Show"}
                    </Button>
                  </div>
                  {chaptersOpen === r.id ? <ChaptersManager subjectId={r.id} subjectName={r.name} /> : null}
                </li>
              ))}
            </ul>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
