"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamPicker } from "@/components/admin/exam-picker";
import { Icons } from "@/components/ui/icons";
import { Select } from "@/components/ui/select";
import { pictureUrl } from "@/components/flashcards/picture-url";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { logAdminAction } from "@/lib/adminLog";
import { FLASHCARD_BUCKET, IMAGE_ACCEPT, IMAGE_COLUMNS, imagePath, imageProblem, type FlashcardImage } from "@/lib/flashcard-images";
import { supabase } from "@/lib/supabaseClient";
import { cleanExams, type ExamId } from "@/lib/subjects";
import { groupBySubject, sortChapters } from "@/lib/taxonomy";

type Message = { type: "success" | "error"; text: string } | null;
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-steel-300";

/** Admin: pick a subject and chapter, choose pictures, upload. Below it, every picture with a delete button. */
export function PictureManager() {
  const [pictures, setPictures] = React.useState<FlashcardImage[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [subjectId, setSubjectId] = React.useState("");
  const [chapterId, setChapterId] = React.useState("");
  const [exams, setExams] = React.useState<ExamId[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [moveSubject, setMoveSubject] = React.useState("");
  const [moveChapter, setMoveChapter] = React.useState("");
  const [moveExams, setMoveExams] = React.useState<ExamId[]>([]);
  const [moving, setMoving] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [progress, setProgress] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<Message>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const taxonomy = useTaxonomy();

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

  const refresh = () => setVersion((v) => v + 1);
  const uploading = progress !== null;
  const subject = taxonomy.subjects.find((x) => x.id === subjectId);
  const chapter = taxonomy.chapters.find((x) => x.id === chapterId && x.subject_id === subjectId);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const bad = picked.map((f) => imageProblem(f)).find(Boolean);
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
    if (!subject) return setMsg({ type: "error", text: "Pick a subject first." });
    if (files.length === 0) return setMsg({ type: "error", text: "Choose at least one picture." });

    let added = 0;
    const failed: string[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      setProgress(`Uploading ${i + 1} of ${files.length}...`);
      const path = imagePath(file, crypto.randomUUID());
      const stored = await supabase.storage.from(FLASHCARD_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
      if (stored.error) {
        failed.push(`${file.name}: ${stored.error.message}`);
        continue;
      }
      const { error } = await supabase.from("flashcard_images").insert({ subject_id: subject.id, chapter_id: chapter?.id ?? null, image_path: path, exams });
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
      if (fileInput.current) fileInput.current.value = "";
      refresh();
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
    const removed = await supabase.storage.from(FLASHCARD_BUCKET).remove([item.image_path]);
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
    const target = taxonomy.subjects.find((x) => x.id === moveSubject);
    if (!target) return setMsg({ type: "error", text: "Pick the subject to move the pictures to." });
    const targetChapter = taxonomy.chapters.find((c) => c.id === moveChapter && c.subject_id === target.id);
    const ids = [...selected];
    setMoving(true);
    setMsg(null);
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
    setMsg({ type: "success", text: `Moved ${data.length} ${data.length === 1 ? "picture" : "pictures"} to ${[target.name, targetChapter?.name].filter(Boolean).join(" > ")}.` });
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

  const sections = React.useMemo(() => groupBySubject(pictures ?? [], taxonomy.subjects, taxonomy.chapters), [pictures, taxonomy.subjects, taxonomy.chapters]);

  return (
    <div className="space-y-8">
      {msg ? (
        <div
          role={msg.type === "error" ? "alert" : "status"}
          className={`flex max-w-3xl items-start gap-2 rounded-control border p-3 text-xs ${
            msg.type === "success" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-danger-500/40 bg-danger-500/10 text-danger-300"
          }`}
        >
          {msg.type === "success" ? <Icons.checkCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Icons.info className="mt-0.5 size-4 shrink-0" aria-hidden />}
          <span>{msg.text}</span>
        </div>
      ) : null}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Add Pictures</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={upload} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="pic-subject" className={labelClass}>Subject</label>
                <Select id="pic-subject" value={subjectId} onChange={(e) => {
                    setSubjectId(e.target.value);
                    setChapterId("");
                    // The subject's own exams are the starting point. Change them freely.
                    setExams(cleanExams(taxonomy.subjects.find((x) => x.id === e.target.value)?.exams));
                  }}>
                  <option value="">Pick a subject</option>
                  {taxonomy.subjects.map((x) => (
                    <option key={x.id} value={x.id}>{x.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label htmlFor="pic-chapter" className={labelClass}>Chapter</label>
                <Select id="pic-chapter" value={chapterId} disabled={!subjectId} onChange={(e) => setChapterId(e.target.value)}>
                  <option value="">{subjectId ? "No chapter" : "Pick a subject first"}</option>
                  {sortChapters(taxonomy.chapters.filter((c) => c.subject_id === subjectId)).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
            </div>
            <p className="text-xs text-steel-500">Add subjects and chapters under Admin Suite, Subjects, Study Subjects.</p>

            <ExamPicker value={exams} onChange={setExams} hint="Tick the exams these cards are for, and they show in those exam folders too. Leave all unticked if they are for everyone." />

            <div className="space-y-1">
              <label htmlFor="pic-files" className={labelClass}>Pictures</label>
              <input
                id="pic-files"
                ref={fileInput}
                type="file"
                multiple
                accept={IMAGE_ACCEPT}
                onChange={pick}
                className="block w-full text-sm text-steel-300 file:mr-3 file:rounded-control file:border file:border-steel-700 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-steel-100"
              />
              <p className="text-xs text-steel-500">PNG, JPG or WebP. Choose as many as you like, each one becomes a flashcard.{files.length > 0 ? ` ${files.length} selected.` : ""}</p>
            </div>

            <Button type="submit" variant="gold" disabled={uploading || !subjectId || files.length === 0}>
              {uploading ? progress : files.length > 1 ? `Add ${files.length} pictures` : "Add picture"}
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label htmlFor="move-subject" className={labelClass}>Move to subject</label>
                  <Select id="move-subject" value={moveSubject} onChange={(e) => { setMoveSubject(e.target.value); setMoveChapter(""); }}>
                    <option value="">Pick a subject</option>
                    {taxonomy.subjects.filter((x) => x.name !== "Unsorted").map((x) => (
                      <option key={x.id} value={x.id}>{x.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="move-chapter" className={labelClass}>Chapter</label>
                  <Select id="move-chapter" value={moveChapter} disabled={!moveSubject} onChange={(e) => setMoveChapter(e.target.value)}>
                    <option value="">{moveSubject ? "No chapter" : "Pick a subject first"}</option>
                    {sortChapters(taxonomy.chapters.filter((c) => c.subject_id === moveSubject)).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="gold" className="w-full" disabled={moving || !moveSubject} onClick={() => void move()}>
                    {moving ? "Working..." : "Move selected"}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-steel-700/60 pt-3">
                <ExamPicker legend="Set exams on the selected pictures" value={moveExams} onChange={setMoveExams} />
                <Button variant="outline" size="sm" disabled={moving} onClick={() => void applyExams()}>Apply exams</Button>
              </div>
            </div>
          ) : null}
          {loadError ? <p role="alert" className="text-xs text-danger-300">Could not load pictures: {loadError}. Have you run migration 014?</p> : null}
          {!pictures && !loadError ? <p className="text-xs text-steel-300">Loading pictures...</p> : null}
          {pictures && pictures.length === 0 ? <p className="text-xs text-steel-300">No pictures yet. Add the first ones above.</p> : null}
          {sections.map((section) => (
            <section key={section.key} aria-label={section.subjectName} className="space-y-4">
              <h3 className="border-b border-steel-700/60 pb-2 text-base font-bold text-white">{section.subjectName}</h3>
              {section.chapters.map((group) => {
                const groupIds = group.items.map((i) => i.id);
                const allOn = groupIds.every((id) => selected.has(id));
                return (
                <div key={group.key} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {group.chapterName ? <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{group.chapterName}</p> : <span />}
                    <label className="flex items-center gap-2 text-xs text-steel-300">
                      <input type="checkbox" checked={allOn} onChange={(e) => toggleSelected(groupIds, e.target.checked)} className="size-4 accent-gold-400" />
                      Select all {groupIds.length} in {group.chapterName ?? section.subjectName}
                    </label>
                  </div>
                  <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {group.items.map((item) => (
                      <li key={item.id} className="overflow-hidden rounded-control border border-steel-700/60 bg-navy-950">
                        <div className="aspect-4/3 w-full bg-navy-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={pictureUrl(item.image_path)} alt={`Flashcard in ${group.chapterName ?? section.subjectName}`} loading="lazy" className="size-full object-contain" />
                        </div>
                        <div className="space-y-2 p-2">
                          <label className="flex items-center gap-2 text-xs text-steel-300">
                            <input type="checkbox" checked={selected.has(item.id)} onChange={(e) => toggleSelected([item.id], e.target.checked)} className="size-4 accent-gold-400" />
                            Select
                            {item.exams?.length ? <span className="ml-auto font-mono text-xs text-gold-300">{item.exams.join(", ").toUpperCase()}</span> : null}
                          </label>
                          <Button variant="danger" size="sm" className="w-full" disabled={busyId === item.id} onClick={() => void remove(item)} aria-label={`Delete picture in ${group.chapterName ?? section.subjectName}`}>
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                );
              })}
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
