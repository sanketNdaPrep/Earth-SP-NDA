"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Select } from "@/components/ui/select";
import { pictureUrl } from "@/components/flashcards/picture-url";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { logAdminAction } from "@/lib/adminLog";
import { FLASHCARD_BUCKET, IMAGE_ACCEPT, IMAGE_COLUMNS, imagePath, imageProblem, type FlashcardImage } from "@/lib/flashcard-images";
import { supabase } from "@/lib/supabaseClient";
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
      const { error } = await supabase.from("flashcard_images").insert({ subject_id: subject.id, chapter_id: chapter?.id ?? null, image_path: path });
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
        details: { subject_id: subject.id, chapter_id: chapter?.id ?? null, count: added },
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
                <Select id="pic-subject" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setChapterId(""); }}>
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
            <p className="text-xs text-steel-500">Add subjects and chapters under Admin Suite, Subjects, Chapters.</p>

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
          {loadError ? <p role="alert" className="text-xs text-danger-300">Could not load pictures: {loadError}. Have you run migration 014?</p> : null}
          {!pictures && !loadError ? <p className="text-xs text-steel-300">Loading pictures...</p> : null}
          {pictures && pictures.length === 0 ? <p className="text-xs text-steel-300">No pictures yet. Add the first ones above.</p> : null}
          {sections.map((section) => (
            <section key={section.key} aria-label={section.subjectName} className="space-y-4">
              <h3 className="border-b border-steel-700/60 pb-2 text-base font-bold text-white">{section.subjectName}</h3>
              {section.chapters.map((group) => (
                <div key={group.key} className="space-y-3">
                  {group.chapterName ? <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">{group.chapterName}</p> : null}
                  <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {group.items.map((item) => (
                      <li key={item.id} className="overflow-hidden rounded-control border border-steel-700/60 bg-navy-950">
                        <div className="aspect-4/3 w-full bg-navy-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={pictureUrl(item.image_path)} alt={`Flashcard in ${group.chapterName ?? section.subjectName}`} loading="lazy" className="size-full object-contain" />
                        </div>
                        <div className="p-2">
                          <Button variant="danger" size="sm" className="w-full" disabled={busyId === item.id} onClick={() => void remove(item)} aria-label={`Delete picture in ${group.chapterName ?? section.subjectName}`}>
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
