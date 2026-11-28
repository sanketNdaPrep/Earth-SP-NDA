import { RESOURCE_BUCKET } from "./resources";
import { supabase } from "./supabaseClient";
import type { ExamId } from "./subjects";

/** Public address of a stored syllabus PDF. */
export function syllabusUrl(path: string): string {
  return supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Subject syllabus PDFs of one exam, keyed by the subject's slug. Empty when none are uploaded. */
export async function loadSubjectSyllabi(exam: ExamId): Promise<Record<string, string>> {
  const [subjects, files] = await Promise.all([
    supabase.from("subjects").select("id, slug").eq("kind", "subject"),
    supabase.from("syllabus_files").select("subject_id, file_path").eq("exam", exam),
  ]);
  if (subjects.error || files.error) return {};
  const slugById = new Map((subjects.data ?? []).map((s: { id: string; slug: string }) => [s.id, s.slug]));
  const result: Record<string, string> = {};
  for (const f of (files.data ?? []) as { subject_id: string; file_path: string }[]) {
    const slug = slugById.get(f.subject_id);
    if (slug) result[slug] = f.file_path;
  }
  return result;
}
