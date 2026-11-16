"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { logAdminAction } from "@/lib/adminLog";
import { CHAPTER_NAME, chapterNameProblem, sortChapters, type Chapter } from "@/lib/taxonomy";
import { supabase } from "@/lib/supabaseClient";

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

  React.useEffect(() => {
    let active = true;
    supabase
      .from("chapters")
      .select("id, subject_id, name, sort_order")
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

  const remove = async (chapter: Chapter) => {
    if (!window.confirm(`Delete the chapter "${chapter.name}"? Decks and files filed under it stay, but lose their chapter.`)) return;
    setBusy(true);
    setProblem(null);
    const { data, error } = await supabase.from("chapters").delete().eq("id", chapter.id).select("id");
    setBusy(false);
    if (error || !data?.length) return setProblem(error?.message ?? "Could not delete the chapter.");
    await record("deleted", chapter.name);
    refresh();
  };

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

      {loadError ? <p role="alert" className="text-xs text-danger-300">{loadError}</p> : null}
      {!chapters && !loadError ? <p className="text-xs text-steel-300">Loading chapters...</p> : null}
      {chapters && chapters.length === 0 ? <p className="text-xs text-steel-300">No chapters yet. Add the first one below.</p> : null}

      {list.length > 0 ? (
        <ul className="divide-y divide-steel-700/40">
          {list.map((c, i) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
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
                  <span className="min-w-0 truncate text-sm text-white">{c.name}</span>
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
                    <Button size="sm" variant="danger" disabled={busy} onClick={() => void remove(c)} aria-label={`Delete ${c.name}`}>Delete</Button>
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
      {problem ? <p role="alert" className="text-xs text-danger-300">{problem}</p> : null}
    </div>
  );
}
