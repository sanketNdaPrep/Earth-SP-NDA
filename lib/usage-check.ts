import { supabase } from "@/lib/supabaseClient";
import { tally } from "@/lib/usage";

type Key = "chapter_id" | "subject_id";

/** How many pictures, study files and decks are filed under each id. Throws with the database message on failure. */
export async function countFiled(key: Key, ids: readonly string[]): Promise<Record<string, number>> {
  if (ids.length === 0) return {};
  const tables = ["flashcard_images", "resources", "flashcard_decks"] as const;
  const results = await Promise.all(tables.map((t) => supabase.from(t).select(key).in(key, [...ids])));
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  const rows = results.flatMap((r) => (r.data ?? []) as unknown as Record<string, unknown>[]);
  return tally(rows, key, ids);
}
