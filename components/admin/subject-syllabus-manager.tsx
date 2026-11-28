"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { logAdminAction } from "@/lib/adminLog";
import { RESOURCE_BUCKET } from "@/lib/resources";
import { pdfProblem, syllabusPath } from "@/lib/pdf-upload";
import { EXAMS, type ExamId } from "@/lib/subjects";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

interface SubjectRow {
  id: string;
  name: string;
  slug: string;
  exams: string[] | null;
}
interface FileRow {
  id: string;
  exam: ExamId;
  subject_id: string;
  file_path: string;
}
type Message = { type: "success" | "error"; text: string } | null;

const publicUrl = (path: string) => supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(path).data.publicUrl;

/** Admin: one syllabus PDF per subject inside each entry scheme. Students download them from the exam folders. */
export function SubjectSyllabusManager() {
  const [exam, setExam] = React.useState<ExamId>("nda");
  const [subjects, setSubjects] = React.useState<SubjectRow[] | null>(null);
  const [files, setFiles] = React.useState<FileRow[]>([]);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<Message>(null);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("subjects").select("id, name, slug, exams").eq("kind", "subject").neq("slug", "unsorted").order("sort_order", { ascending: true }),
      supabase.from("syllabus_files").select("id, exam, subject_id, file_path"),
    ]).then(([s, f]) => {
      if (!active) return;
      const error = s.error ?? f.error;
      if (error) return setLoadError(error.message);
      setLoadError(null);
      setSubjects((s.data ?? []) as SubjectRow[]);
      setFiles((f.data ?? []) as FileRow[]);
    });
    return () => {
      active = false;
    };
  }, [version]);

  const rows = (subjects ?? []).filter((s) => (s.exams ?? []).includes(exam));
  const fileFor = (subjectId: string) => files.find((f) => f.exam === exam && f.subject_id === subjectId);

  const upload = async (subject: SubjectRow, file: File | undefined, input: HTMLInputElement) => {
    if (!file) return;
    setMsg(null);
    const bad = pdfProblem(file);
    if (bad) {
      input.value = "";
      return setMsg({ type: "error", text: bad });
    }
    const old = fileFor(subject.id);
    setBusyId(subject.id);
    // A new name each time, so a student never gets a cached older syllabus.
    const path = syllabusPath(`${exam}-${subject.slug}-${crypto.randomUUID().slice(0, 8)}`);
    const stored = await supabase.storage.from(RESOURCE_BUCKET).upload(path, file, { contentType: "application/pdf", upsert: false });
    if (stored.error) {
      input.value = "";
      setBusyId(null);
      return setMsg({ type: "error", text: stored.error.message });
    }
    const saved = await supabase
      .from("syllabus_files")
      .upsert({ exam, subject_id: subject.id, file_path: path, updated_at: new Date().toISOString() }, { onConflict: "exam,subject_id" })
      .select("id");
    if (saved.error || !saved.data?.length) {
      await supabase.storage.from(RESOURCE_BUCKET).remove([path]);
      input.value = "";
      setBusyId(null);
      return setMsg({ type: "error", text: saved.error?.message ?? "The syllabus was not saved. You may not have permission." });
    }
    if (old) await supabase.storage.from(RESOURCE_BUCKET).remove([old.file_path]);
    const examName = EXAMS.find((e) => e.id === exam)?.name ?? exam;
    await logAdminAction({ action: old ? "edited" : "added", entityType: "subject", label: `${examName} ${subject.name} syllabus PDF`, details: { subject_id: subject.id, exam, file_path: path } });
    input.value = "";
    setBusyId(null);
    setMsg({ type: "success", text: `${subject.name} syllabus saved for ${examName}. Students see it in the ${examName} folder.` });
    setVersion((v) => v + 1);
  };

  const remove = async (subject: SubjectRow) => {
    const old = fileFor(subject.id);
    const examName = EXAMS.find((e) => e.id === exam)?.name ?? exam;
    if (!old || !window.confirm(`Remove the ${examName} ${subject.name} syllabus PDF? Students will no longer see the download.`)) return;
    setBusyId(subject.id);
    setMsg(null);
    const { data, error } = await supabase.from("syllabus_files").delete().eq("id", old.id).select("id");
    if (error || !data?.length) {
      setBusyId(null);
      return setMsg({ type: "error", text: error?.message ?? "Could not remove the syllabus." });
    }
    await supabase.storage.from(RESOURCE_BUCKET).remove([old.file_path]);
    await logAdminAction({ action: "deleted", entityType: "subject", label: `${examName} ${subject.name} syllabus PDF`, details: { subject_id: subject.id, exam } });
    setBusyId(null);
    setMsg({ type: "success", text: `${subject.name} syllabus removed from ${examName}.` });
    setVersion((v) => v + 1);
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="text-lg">Subject-wise syllabus PDFs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-steel-500">
          Pick an entry scheme, then upload one PDF per subject (up to 50 MB). Uploading again replaces the old file. Students get a download button in that exam&apos;s folder and on its page.
          Only subjects tagged for the exam are listed; change the tags under Subjects.
        </p>
        <div role="tablist" aria-label="Entry scheme" className="flex gap-2">
          {EXAMS.map((e) => (
            <button
              key={e.id}
              role="tab"
              type="button"
              aria-selected={exam === e.id}
              onClick={() => setExam(e.id)}
              className={cn(
                "h-10 rounded-control border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400",
                exam === e.id ? "border-gold-400 bg-gold-400 text-navy-950" : "border-steel-700 bg-navy-950 text-steel-100 hover:border-steel-500",
              )}
            >
              {e.name}
            </button>
          ))}
        </div>
        {msg ? (
          <Notice floating kind={msg.type} reveal={false} onClose={() => setMsg(null)} autoHideMs={msg.type === "success" ? 8000 : undefined}>{msg.text}</Notice>
        ) : null}
        {loadError ? <Notice kind="error" reveal={false} title="Could not load">Could not load the subjects: {loadError}. Has migration 023 been run?</Notice> : null}
        {!subjects && !loadError ? <p className="text-xs text-steel-300">Loading...</p> : null}
        {subjects && rows.length === 0 ? <p className="text-sm text-steel-300">No subjects are tagged for this exam yet.</p> : null}
        <ul className="space-y-3">
          {rows.map((s) => {
            const f = fileFor(s.id);
            return (
              <li key={s.id} className="space-y-2 rounded-control border border-steel-700/60 bg-navy-950 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-white">{s.name}</p>
                  <span className="text-xs text-steel-300">{f ? "Syllabus uploaded" : "No syllabus yet"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`ssyl-${exam}-${s.id}`}>{s.name} syllabus PDF</label>
                  <input
                    id={`ssyl-${exam}-${s.id}`}
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={busyId === s.id}
                    onChange={(e) => void upload(s, e.target.files?.[0], e.target)}
                    className="block min-w-0 flex-1 text-sm text-steel-300 file:mr-3 file:rounded-control file:border file:border-steel-700 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-steel-100"
                  />
                  {f ? (
                    <>
                      <a href={publicUrl(f.file_path)} target="_blank" rel="noreferrer" className="text-xs font-semibold text-gold-400 underline">View</a>
                      <Button variant="danger" size="sm" disabled={busyId === s.id} onClick={() => void remove(s)}>Remove</Button>
                    </>
                  ) : null}
                </div>
                {busyId === s.id ? <p className="text-xs text-steel-300">Working...</p> : null}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
