import { logAdminAction } from "@/lib/adminLog";
import { uniqueSlug, type FilingCheck } from "@/lib/filing";
import { supabase } from "@/lib/supabaseClient";
import type { ExamId } from "@/lib/subjects";

export type FilingSaved =
  | { ok: true; subject: { id: string; name: string }; chapter: { id: string; name: string } | null; created: string[] }
  | { ok: false; error: string };

/**
 * Makes the typed subject and chapter real. A subject or chapter that already exists is reused;
 * a new one is created. A new subject starts with the exams ticked on the form.
 */
export async function saveFiling(check: Extract<FilingCheck, { ok: true }>, exams: readonly ExamId[]): Promise<FilingSaved> {
  const created: string[] = [];
  let subject: { id: string; name: string };

  if (check.existingSubject) {
    subject = { id: check.existingSubject.id, name: check.existingSubject.name };
  } else {
    const { data: rows, error: readError } = await supabase.from("subjects").select("slug, sort_order, kind");
    if (readError) return { ok: false, error: readError.message };
    const slug = uniqueSlug(check.subjectName, new Set((rows ?? []).map((r) => r.slug as string)));
    if (!slug) return { ok: false, error: "Use letters or numbers in the subject name." };
    const last = (rows ?? []).reduce((max, r) => (r.kind === "subject" && (r.sort_order as number) < 900 ? Math.max(max, r.sort_order as number) : max), 0);
    const { data, error } = await supabase
      .from("subjects")
      .insert({ name: check.subjectName, slug, kind: "subject", description: "", icon_name: "book", is_active: true, sort_order: last + 10, exams: [...exams] })
      .select("id");
    if (error || !data?.length) return { ok: false, error: error?.message ?? "The new subject could not be created." };
    subject = { id: data[0].id as string, name: check.subjectName };
    created.push(`subject ${check.subjectName}`);
    await logAdminAction({ action: "added", entityType: "subject", label: check.subjectName, details: { subject_id: subject.id, exams: [...exams] } });
  }

  let chapter: { id: string; name: string } | null = null;
  if (check.chapterName) {
    if (check.existingChapter) {
      chapter = { id: check.existingChapter.id, name: check.existingChapter.name };
    } else {
      const { data: siblings } = await supabase.from("chapters").select("sort_order").eq("subject_id", subject.id);
      const last = (siblings ?? []).reduce((max, r) => Math.max(max, r.sort_order as number), 0);
      const { data, error } = await supabase.from("chapters").insert({ subject_id: subject.id, name: check.chapterName, sort_order: last + 1 }).select("id");
      if (error || !data?.length) {
        // Someone added the same chapter a moment ago: use theirs.
        if (error?.code === "23505") {
          const { data: again } = await supabase.from("chapters").select("id, name").eq("subject_id", subject.id).ilike("name", check.chapterName);
          if (again?.length) chapter = { id: again[0].id as string, name: again[0].name as string };
        }
        if (!chapter) return { ok: false, error: error?.message ?? "The new chapter could not be created." };
      } else {
        chapter = { id: data[0].id as string, name: check.chapterName };
        created.push(`chapter ${check.chapterName}`);
        await logAdminAction({ action: "added", entityType: "subject", label: `${subject.name}: ${check.chapterName}`, details: { subject_id: subject.id, chapter_id: chapter.id } });
      }
    }
  }
  return { ok: true, subject, chapter, created };
}
