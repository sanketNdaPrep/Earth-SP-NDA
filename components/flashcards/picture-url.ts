import { FLASHCARD_BUCKET } from "@/lib/flashcard-images";
import { supabase } from "@/lib/supabaseClient";

/** The public address of an uploaded flashcard picture. */
export function pictureUrl(path: string): string {
  return supabase.storage.from(FLASHCARD_BUCKET).getPublicUrl(path).data.publicUrl;
}
