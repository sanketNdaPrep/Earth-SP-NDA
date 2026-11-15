"use server";

import { isLetter } from "@/lib/mockScoring";
import type { PracticeKeyResult, PracticeKeyRow } from "@/lib/mockEngine";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The answer key and solutions of a practice module. The browser asks for it only once the
 * cadet has submitted, because the questions table no longer holds it. Signed-in cadets only.
 * Reads with the service role: question_answers is closed to everyone except approved admins.
 */
export async function getPracticeKey(quizId: string): Promise<PracticeKeyResult> {
  if (!UUID.test(quizId)) return { ok: false, reason: "missing", message: "That module could not be found." };

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return { ok: false, reason: "auth", message: "Sign in to see your marks." };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, reason: "config", message: "The marking server is not set up yet." };

  const questions = await admin.from("questions").select("id").eq("quiz_id", quizId);
  if (questions.error) return { ok: false, reason: "error", message: "The paper could not be marked. Try again." };
  const ids = ((questions.data ?? []) as { id: string }[]).map((row) => row.id);
  if (ids.length === 0) return { ok: true, key: [] };

  const answers = await admin.from("question_answers").select("question_id, correct_option, explanation").in("question_id", ids);
  if (answers.error) return { ok: false, reason: "error", message: "The paper could not be marked. Try again." };

  const byId = new Map(((answers.data ?? []) as { question_id: string; correct_option: string | null; explanation: string | null }[]).map((row) => [row.question_id, row]));
  const key: PracticeKeyRow[] = ids.map((id) => {
    const row = byId.get(id);
    return { id, correct: isLetter(row?.correct_option) ? row.correct_option : null, explanation: row?.explanation?.trim() ? row.explanation : null };
  });
  return { ok: true, key };
}
