"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CoverEditor } from "@/components/admin/cover-editor";
import { logAdminAction } from "@/lib/adminLog";
import { removeCovers, uploadCover } from "@/lib/cover-upload";
import { countFiled } from "@/lib/usage-check";
import { blockedMessage, splitDeletable } from "@/lib/usage";
import { CHAPTER_NAME, chapterNameProblem, parseChapterList, sortChapters, type Chapter } from "@/lib/taxonomy";
import { supabase } from "@/lib/supabaseClient";
import { Notice } from "@/components/ui/notice";

const inputClass =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none";

/** Add, rename, reorder and delete the chapters of one subject. */
export function ChaptersManager({ subjectId, subjectName }: { subjectId: string; subjectName: string }) {
  const [chapters, setChapters] = React.useState<Chapter[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [name, setName] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [problem, setProblem] = React.useState<string | null>(null);
  const [many, setMany] = React.useState(false);
  const [pasted, setPasted] = React.useState("");
  const [note, setNote] = React.useState<string | null>(null);
  const [ticked, setTicked] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    let active = true;
    supabase
      .from("chapters")
      .select("id, subject_id, name, sort_order, cover_path")
      .eq("subject_id", subjectId)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) return setLoadError(/schema cache|does not exist/i.test(error.message) ? "Chapters are not set up yet. Run migration 013 in Supabase first." : error.message);
        setLoadError(null);
        setChapters(sortChapters((data ?? []) as Chapter[]));
      });
    return () => {
      active = false;
    };
  }, [subjectId, version]);

  const refresh = () => setVersion((v) => v + 1);
  const list = chapters ?? [];

  const record = (action: "added" | "edited" | "deleted", chapter: string) =>
    logAdminAction({ action, entityType: "subject", label: `${subjectName}: ${chapter}`, details: { subject_id: subjectId, chapter } });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const issue = chapterNameProblem(name, list);
    if (issue) return setProblem(issue);
    setBusy(true);
    setProblem(null);
    const next = list.length ? Math.max(...list.map((c) => c.sort_order)) + 1 : 1;
    const { error } = await supabase.from("chapters").insert({ subject_id: subjectId, name: name.trim(), sort_order: next });
    setBusy(false);
    if (error) return setProblem(error.code === "23505" ? "This subject already has a chapter with that name." : error.message);
    await record("added", name.trim());
    setName("");
    refresh();
  };

  const addMany = async (e: React.FormEvent) => {
    e.preventDefault();
    const { names, skipped } = parseChapterList(pasted, list);
    setNote(null);
    if (names.length === 0) return setProblem(skipped.length > 0 ? "Nothing new to add. Every line was already there or the wrong length." : "Paste at least one chapter name, one per line.");
    setBusy(true);
    setProblem(null);
    const start = list.length ? Math.max(...list.map((c) => c.sort_order)) : 0;
    const { error } = await supabase.from("chapters").insert(names.map((n, i) => ({ subject_id: subjectId, name: n, sort_order: start + i + 1 })));
    setBusy(false);
    if (error) return setProblem(error.code === "23505" ? "One of those chapters already exists in this subject." : error.message);
    await logAdminAction({ action: "added", entityType: "subject", label: `${subjectName}: ${names.length} chapters`, details: { subject_id: subjectId, chapters: names } });
    setPasted("");
    setNote(`Added ${names.length} ${names.length === 1 ? "chapter" : "chapters"}.${skipped.length > 0 ? ` Left out ${skipped.length}: ${skipped.map((x) => `${x.line} (${x.reason})`).join("; ")}.` : ""}`);
    refresh();
  };

  const rename = async (chapter: Chapter) => {
    const issue = chapterNameProblem(editName, list, chapter.id);
    if (issue) return setProblem(issue);
    setBusy(true);
    setProblem(null);
    const { data, error } = await supabase.from("chapters").update({ name: editName.trim() }).eq("id", chapter.id).select("id");
    setBusy(false);
    if (error || !data?.length) return setProblem(error?.message ?? "Could not rename the chapter.");
    await record("edited", editName.trim());
    setEditingId(null);
    refresh();
  };

  /** Deletes chapters that hold nothing. A chapter that still has cards, files or decks is left alone. */
  const removeMany = async (targets: Chapter[]) => {
    if (targets.length === 0) return;
    setBusy(true);
    setProblem(null);
    setNote(null);
    let usage: Record<string, number>;
    try {
      usage = await countFiled("chapter_id", targets.map((c) => c.id));
    } catch (err) {
      setBusy(false);
      return setProblem(err instanceof Error ? err.message : "Could not check what is inside.");
    }
    const { free, busy: blocked } = splitDeletable(targets.map((c) => c.id), usage);
    const blockedNames = targets.filter((c) => blocked.includes(c.id)).map((c) => c.name);
    if (free.length === 0) {
      setBusy(false);
      return setProblem(blockedMessage("chapter", blockedNames));
    }
    const doomed = targets.filter((c) => free.includes(c.id));
    const sure = window.confirm(
      doomed.length === 1 ? `Delete the chapter "${doomed[0].name}"?` : `Delete ${doomed.length} chapters (${doomed.slice(0, 3).map((c) => c.name).join(", ")}${doomed.length > 3 ? ", ..." : ""})?`,
    );
    if (!sure) {
      setBusy(false);
      return;
    }
    const { data, error } = await supabase.from("chapters").delete().in("id", free).select("id");
    setBusy(false);
    if (error || !data?.length) return setProblem(error?.message ?? "Could not delete the chapters.");
    await removeCovers(doomed.map((c) => c.cover_path));
    await logAdminAction({ action: "deleted", entityType: "subject", label: `${subjectName}: ${doomed.length === 1 ? doomed[0].name : `${doomed.length} chapters`}`, details: { subject_id: subjectId, chapters: doomed.map((c) => c.name) } });
    setTicked(new Set());
    setNote(`Deleted ${data.length} ${data.length === 1 ? "chapter" : "chapters"}.${blockedNames.length > 0 ? ` Kept ${blockedNames.length} that still hold content: ${blockedNames.join(", ")}.` : ""}`);
    refresh();
  };

  const setCover = async (chapter: Chapter, file: File | null) => {
    setBusy(true);
    setProblem(null);
    setNote(null);
    let next: string | null = null;
    if (file) {
      const up = await uploadCover(file);
      if ("error" in up) {
        setBusy(false);
        return setProblem(up.error);
      }
      next = up.path;
    }
    const { data, error } = await supabase.from("chapters").update({ cover_path: next }).eq("id", chapter.id).select("id");
    if (error || !data?.length) {
      await removeCovers([next]);
      setBusy(false);
      return setProblem(error?.message ?? "The cover was not saved. You may not have permission.");
    }
    await removeCovers([chapter.cover_path]);
    await record("edited", `${chapter.name} cover`);
    setBusy(false);
    setNote(file ? `Cover saved for ${chapter.name}.` : `Cover removed from ${chapter.name}.`);
    refresh();
  };

  const toggleTick = (id: string, on: boolean) =>
    setTicked((cur) => {
      const next = new Set(cur);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  const allTicked = list.length > 0 && list.every((c) => ticked.has(c.id));

  const move = async (index: number, direction: -1 | 1) => {
    const a = list[index];
    const b = list[index + direction];
    if (!a || !b) return;
    setBusy(true);
    setProblem(null);
    // Swap the two, then number the whole list 1, 2, 3 so equal positions can never cause trouble.
    const order = list.map((c) => c.id);
    [order[index], order[index + direction]] = [order[index + direction], order[index]];
    const results = await Promise.all(order.map((id, i) => supabase.from("chapters").update({ sort_order: i + 1 }).eq("id", id)));
    setBusy(false);
    const failed = results.find((r) => r.error);
    if (failed?.error) setProblem(failed.error.message);
    refresh();
  };

  return (
    <div className="w-full space-y-3 rounded-control border border-steel-700/60 bg-navy-950 p-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">Chapters in {subjectName}</p>

      {loadError ? <Notice kind="error" reveal={false} title="Could not load">{loadError}</Notice> : null}
      {!chapters && !loadError ? <p className="text-xs text-steel-300">Loading chapters...</p> : null}
      {chapters && chapters.length === 0 ? <p className="text-xs text-steel-300">No chapters yet. Add the first one below.</p> : null}

      {list.length > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-steel-300">
            <input type="checkbox" className="size-4 accent-gold-400" checked={allTicked} onChange={(e) => setTicked(e.target.checked ? new Set(list.map((c) => c.id)) : new Set())} />
            Select all {list.length} chapters
          </label>
          {ticked.size > 0 ? (
            <Button type="button" size="sm" variant="danger" disabled={busy} onClick={() => void removeMany(list.filter((c) => ticked.has(c.id)))}>
              Delete selected ({ticked.size})
            </Button>
          ) : null}
        </div>
      ) : null}

      {list.length > 0 ? (
        <ul className="divide-y divide-steel-700/40 overflow-hidden rounded-panel border border-steel-700/60">
          {list.map((c, i) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2 px-4 transition-colors duration-(--duration-base) even:bg-steel-100/2 hover:bg-gold-400/6">
              {editingId === c.id ? (
                <form
                  className="flex min-w-0 flex-1 gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void rename(c);
                  }}
                >
                  <input aria-label={`New name for ${c.name}`} className={inputClass} value={editName} maxLength={CHAPTER_NAME.max} onChange={(e) => setEditName(e.target.value)} autoFocus />
                  <Button type="submit" size="sm" variant="gold" disabled={busy}>Save</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                </form>
              ) : (
                <>
                  <label className="flex min-w-0 items-center gap-2">
                    <input type="checkbox" className="size-4 shrink-0 accent-gold-400" checked={ticked.has(c.id)} onChange={(e) => toggleTick(c.id, e.target.checked)} aria-label={`Select ${c.name}`} />
                    <span className="min-w-0 truncate text-sm text-white">{c.name}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" disabled={busy || i === 0} onClick={() => void move(i, -1)} aria-label={`Move ${c.name} up`}>Up</Button>
                    <Button size="sm" variant="outline" disabled={busy || i === list.length - 1} onClick={() => void move(i, 1)} aria-label={`Move ${c.name} down`}>Down</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => {
                        setEditingId(c.id);
                        setEditName(c.name);
                        setProblem(null);
                      }}
                      aria-label={`Rename ${c.name}`}
                    >
                      Rename
                    </Button>
                    <Button size="sm" variant="danger" disabled={busy} onClick={() => void removeMany([c])} aria-label={`Delete ${c.name}`}>Delete</Button>
                  </div>
                  <div className="w-full">
                    <CoverEditor label={c.name} coverPath={c.cover_path} busy={busy} onChange={(file) => setCover(c, file)} />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={add} className="flex gap-2">
        <label htmlFor={`new-chapter-${subjectId}`} className="sr-only">New chapter name</label>
        <input id={`new-chapter-${subjectId}`} className={inputClass} value={name} maxLength={CHAPTER_NAME.max} onChange={(e) => setName(e.target.value)} placeholder="New chapter, for example Trigonometry" />
        <Button type="submit" variant="gold" size="sm" disabled={busy || Boolean(loadError)}>Add chapter</Button>
      </form>
      <div className="border-t border-steel-700/40 pt-3">
        <Button type="button" size="sm" variant="outline" aria-expanded={many} onClick={() => setMany((v) => !v)}>
          {many ? "Hide the list box" : "Add many at once"}
        </Button>
        {many ? (
          <form onSubmit={addMany} className="mt-3 space-y-2">
            <label htmlFor={`many-chapters-${subjectId}`} className="block text-xs text-steel-300">
              Paste the chapter names, one on each line. Numbers and bullets are fine.
            </label>
            <textarea
              id={`many-chapters-${subjectId}`}
              rows={6}
              className={inputClass}
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={"Algebra\nCalculus\nTrigonometry"}
            />
            <Button type="submit" variant="gold" size="sm" disabled={busy || Boolean(loadError)}>
              Add all chapters
            </Button>
          </form>
        ) : null}
      </div>
      {note ? <Notice kind="success" onClose={() => setNote(null)} autoHideMs={8000}>{note}</Notice> : null}
      {problem ? <Notice kind="error" onClose={() => setProblem(null)}>{problem}</Notice> : null}
    </div>
  );
}
