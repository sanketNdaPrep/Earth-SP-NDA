import { imageProblem } from "@/lib/flashcard-images";
import { coverPath, SUBJECT_COVER_BUCKET } from "@/lib/subjects";
import { supabase } from "@/lib/supabaseClient";

/** Why a file cannot be a cover, or null. */
export function coverProblem(file: Pick<File, "type" | "size" | "name">): string | null {
  return imageProblem(file);
}

/** Uploads a cover picture. Returns its path, or a message. */
export async function uploadCover(file: File): Promise<{ path: string } | { error: string }> {
  const bad = coverProblem(file);
  if (bad) return { error: bad };
  const path = coverPath(file, crypto.randomUUID());
  const stored = await supabase.storage.from(SUBJECT_COVER_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  return stored.error ? { error: stored.error.message } : { path };
}

/** Deletes cover files. Never throws: a leftover file is not worth failing a save for. */
export async function removeCovers(paths: readonly (string | null | undefined)[]): Promise<void> {
  const list = paths.filter((p): p is string => Boolean(p));
  if (list.length > 0) await supabase.storage.from(SUBJECT_COVER_BUCKET).remove(list);
}
