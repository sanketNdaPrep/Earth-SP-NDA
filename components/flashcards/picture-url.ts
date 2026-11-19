import { SUBJECT_COVER_BUCKET } from "@/lib/subjects";
import { FLASHCARD_BUCKET } from "@/lib/flashcard-images";
import { supabase } from "@/lib/supabaseClient";

/** The public address of an uploaded flashcard picture. */
export function pictureUrl(path: string): string {
  return supabase.storage.from(FLASHCARD_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** The public address of a subject's cover picture. */
export function subjectCoverUrl(path: string): string {
  return supabase.storage.from(SUBJECT_COVER_BUCKET).getPublicUrl(path).data.publicUrl;
}
