"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logAdminAction } from "@/lib/adminLog";
import { RESOURCE_BUCKET } from "@/lib/resources";
import { pdfProblem, syllabusPath } from "@/lib/pdf-upload";
import { supabase } from "@/lib/supabaseClient";
import { Notice } from "@/components/ui/notice";

interface ExamRow {
  id: string;
  name: string;
  slug: string;
  syllabus_path: string | null;
}

type Message = { type: "success" | "error"; text: string } | null;

/** Admin: one syllabus PDF per entry scheme. Students download it from that exam's page. */
export function SyllabusManager() {
  const [rows, setRows] = React.useState<ExamRow[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<Message>(null);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("subjects")
      .select("id, name, slug, syllabus_path")
      .eq("kind", "exam")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) return setLoadError(error.message);
        setLoadError(null);
        setRows((data ?? []) as ExamRow[]);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const upload = async (row: ExamRow, file: File | undefined, input: HTMLInputElement) => {
    if (!file) return;
    setMsg(null);
    const bad = pdfProblem(file);
    if (bad) {
      input.value = "";
      return setMsg({ type: "error", text: bad });
    }
    setBusyId(row.id);
    // A new name each time, so a student never gets a cached older syllabus.
    const path = syllabusPath(`${row.slug}-${crypto.randomUUID().slice(0, 8)}`);
    const stored = await supabase.storage.from(RESOURCE_BUCKET).upload(path, file, { contentType: "application/pdf", upsert: false });
    if (stored.error) {
      input.value = "";
      setBusyId(null);
      return setMsg({ type: "error", text: stored.error.message });
    }
    const { data, error } = await supabase.from("subjects").update({ syllabus_path: path }).eq("id", row.id).select("id");
    if (error || !data?.length) {
      await supabase.storage.from(RESOURCE_BUCKET).remove([path]);
      input.value = "";
      setBusyId(null);
      return setMsg({ type: "error", text: error?.message ?? "The syllabus was not saved. You may not have permission." });
    }
    if (row.syllabus_path) await supabase.storage.from(RESOURCE_BUCKET).remove([row.syllabus_path]);
    await logAdminAction({ action: row.syllabus_path ? "edited" : "added", entityType: "subject", label: `${row.name} syllabus PDF`, details: { subject_id: row.id, syllabus_path: path } });
    input.value = "";
    setBusyId(null);
    setMsg({ type: "success", text: `${row.name} syllabus uploaded. Students can download it from the ${row.name} page.` });
    setVersion((v) => v + 1);
  };

  const remove = async (row: ExamRow) => {
    if (!row.syllabus_path || !window.confirm(`Remove the ${row.name} syllabus PDF? Students will no longer see the download.`)) return;
    setBusyId(row.id);
    setMsg(null);
    const { data, error } = await supabase.from("subjects").update({ syllabus_path: null }).eq("id", row.id).select("id");
    if (error || !data?.length) {
      setBusyId(null);
      return setMsg({ type: "error", text: error?.message ?? "Could not remove the syllabus." });
    }
    await supabase.storage.from(RESOURCE_BUCKET).remove([row.syllabus_path]);
    await logAdminAction({ action: "deleted", entityType: "subject", label: `${row.name} syllabus PDF`, details: { subject_id: row.id } });
    setBusyId(null);
    setMsg({ type: "success", text: `${row.name} syllabus removed.` });
    setVersion((v) => v + 1);
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="text-lg">Syllabus PDFs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-steel-500">Upload one PDF per entry scheme (up to 50 MB). Students see a &quot;Download syllabus&quot; button on that exam&apos;s page.</p>
        {msg ? (
        <Notice kind={msg.type} onClose={() => setMsg(null)} autoHideMs={msg.type === "success" ? 8000 : undefined}>{msg.text}</Notice>
      ) : null}
        {loadError ? <Notice kind="error" reveal={false} title="Could not load">Could not load the entry schemes: {loadError}. Has migration 017 been run?</Notice> : null}
        {!rows && !loadError ? <p className="text-xs text-steel-300">Loading...</p> : null}
        <ul className="space-y-3">
          {(rows ?? []).map((row) => (
            <li key={row.id} className="space-y-2 rounded-control border border-steel-700/60 bg-navy-950 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-white">{row.name}</p>
                <span className="font-mono text-xs text-steel-300">{row.syllabus_path ? "Syllabus uploaded" : "No syllabus yet"}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`syl-${row.id}`}>Syllabus PDF for {row.name}</label>
                <input
                  id={`syl-${row.id}`}
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={busyId === row.id}
                  onChange={(e) => void upload(row, e.target.files?.[0], e.target)}
                  className="block min-w-0 flex-1 text-sm text-steel-300 file:mr-3 file:rounded-control file:border file:border-steel-700 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-steel-100"
                />
                {row.syllabus_path ? (
                  <Button variant="danger" size="sm" disabled={busyId === row.id} onClick={() => void remove(row)}>Remove</Button>
                ) : null}
              </div>
              {busyId === row.id ? <p className="text-xs text-steel-300">Working...</p> : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
