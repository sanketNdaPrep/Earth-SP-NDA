import { signatureOf, type BuilderQuestion } from "@/lib/test-questions";
import { supabase } from "@/lib/supabaseClient";

/** What was saved before, so only the changes are written. Keyed by question id. */
export type SavedQuestions = ReadonlyMap<string, { owned: boolean; signature: string }>;

export function savedMapOf(list: readonly BuilderQuestion[]): Map<string, { owned: boolean; signature: string }> {
  const map = new Map<string, { owned: boolean; signature: string }>();
  for (const q of list) if (q.id) map.set(q.id, { owned: q.owned, signature: signatureOf(q) });
  return map;
}

export interface QuestionSaveResult {
  ok: boolean;
  error: string | null;
  /** The list with new ids filled in, so a second save does not add them again. */
  list: BuilderQuestion[];
  added: number;
  edited: number;
  deleted: number;
}

const isMissingTopic = (message: string) => /topic/i.test(message);

function rowOf(q: BuilderQuestion, testId: string, id: string, position: number): Record<string, string | number | null> {
  return {
    id,
    quiz_id: null,
    mock_test_id: testId,
    question_text: q.text.trim(),
    option_a: q.options.A.trim(),
    option_b: q.options.B.trim(),
    option_c: q.options.C.trim(),
    option_d: q.options.D.trim(),
    position,
  };
}

/**
 * Writes a test's own questions: new ones are inserted with their answer key, edited ones are updated,
 * and ones taken out of the list are deleted (a shared bank question is only unlinked, never deleted).
 * A new question never stays without its answer key.
 */
export async function saveTestQuestions(
  testId: string,
  list: readonly BuilderQuestion[],
  before: SavedQuestions,
): Promise<QuestionSaveResult> {
  const next = list.map((q) => ({ ...q }));
  let added = 0;
  let edited = 0;
  let deleted = 0;
  const fail = (error: string): QuestionSaveResult => ({ ok: false, error, list: next, added, edited, deleted });

  // 1. Own questions that were taken out of the list.
  const keep = new Set(next.map((q) => q.id).filter((id): id is string => Boolean(id)));
  const removed = [...before.entries()].filter(([id, info]) => info.owned && !keep.has(id)).map(([id]) => id);
  if (removed.length > 0) {
    const result = await supabase.from("questions").delete().in("id", removed);
    if (result.error) return fail(result.error.message);
    deleted = removed.length;
  }

  // 2. New and edited own questions.
  for (let i = 0; i < next.length; i += 1) {
    const q = next[i];
    if (!q.owned) continue;
    const position = i + 1;
    if (!q.id) {
      const id = crypto.randomUUID();
      const row = rowOf(q, testId, id, position);
      const topic = q.tag.trim() || null;
      let inserted = await supabase.from("questions").insert(topic ? { ...row, topic } : row);
      if (inserted.error && topic && isMissingTopic(inserted.error.message)) inserted = await supabase.from("questions").insert(row);
      if (inserted.error) return fail(`Question ${position}: ${inserted.error.message}`);
      const key = await supabase.from("question_answers").insert({ question_id: id, correct_option: q.correct, explanation: q.explanation.trim() || null });
      if (key.error) {
        await supabase.from("questions").delete().eq("id", id);
        return fail(`Question ${position}: ${key.error.message}`);
      }
      next[i] = { ...q, id, flags: q.flags };
      added += 1;
      continue;
    }
    const old = before.get(q.id);
    const changed = !old || old.signature !== signatureOf(q);
    if (changed) {
      const { id: _id, quiz_id: _quiz, mock_test_id: _test, ...fields } = rowOf(q, testId, q.id, position);
      void _id;
      void _quiz;
      void _test;
      const topic = q.tag.trim() || null;
      let updated = await supabase.from("questions").update({ ...fields, topic }).eq("id", q.id).select("id");
      if (updated.error && isMissingTopic(updated.error.message)) updated = await supabase.from("questions").update(fields).eq("id", q.id).select("id");
      if (updated.error || !updated.data?.length) return fail(`Question ${position}: ${updated.error?.message ?? "you may not have permission"}`);
      const key = await supabase
        .from("question_answers")
        .upsert({ question_id: q.id, correct_option: q.correct, explanation: q.explanation.trim() || null }, { onConflict: "question_id" });
      if (key.error) return fail(`Question ${position}: ${key.error.message}`);
      edited += 1;
    } else {
      // Only the position may have moved.
      const moved = await supabase.from("questions").update({ position }).eq("id", q.id);
      if (moved.error) return fail(`Question ${position}: ${moved.error.message}`);
    }
  }

  // 3. The links, in order. Unlink what was removed from the test.
  const ids = next.map((q) => q.id as string);
  const unlinked = [...before.entries()].filter(([id, info]) => !info.owned && !keep.has(id)).map(([id]) => id);
  if (unlinked.length > 0) {
    const result = await supabase.from("test_questions").delete().eq("mock_test_id", testId).in("question_id", unlinked);
    if (result.error) return fail(result.error.message);
  }
  if (ids.length > 0) {
    const linked = await supabase
      .from("test_questions")
      .upsert(ids.map((id, i) => ({ mock_test_id: testId, question_id: id, position: i + 1 })), { onConflict: "mock_test_id,question_id" });
    if (linked.error) return fail(linked.error.message);
  }
  return { ok: true, error: null, list: next, added, edited, deleted };
}

/** Where a test's original PDF is kept. */
export const TEST_PDF_BUCKET = "study-materials";
export function testPdfPath(id: string): string {
  return `tests/${id}.pdf`;
}

export async function uploadTestPdf(file: File): Promise<{ path: string } | { error: string }> {
  const path = testPdfPath(crypto.randomUUID());
  const stored = await supabase.storage.from(TEST_PDF_BUCKET).upload(path, file, { contentType: "application/pdf", upsert: false });
  return stored.error ? { error: stored.error.message } : { path };
}

export async function removeTestPdf(path: string | null | undefined): Promise<void> {
  if (path) await supabase.storage.from(TEST_PDF_BUCKET).remove([path]);
}
