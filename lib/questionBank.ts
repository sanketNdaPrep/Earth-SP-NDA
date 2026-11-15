import type { Opt } from "@/components/admin/seed/types";

/** A question as the admin question bank loads it. */
export interface BankQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  /** From question_answers. null when no key row exists. */
  correct_option: Opt | null;
  /** From question_answers. */
  explanation: string | null;
  position: number | null;
  created_at: string;
}

export interface BankModule {
  id: string;
  title: string;
  category: string;
}

/**
 * Columns the question bank reads. The answer key lives in question_answers, which only
 * approved admins can read, so it is embedded here and flattened by toBankQuestion.
 */
export const BANK_COLUMNS =
  "id, quiz_id, question_text, option_a, option_b, option_c, option_d, position, created_at, question_answers(correct_option, explanation)";

type AnswerEmbed = { correct_option?: string | null; explanation?: string | null };

/** Turns a row read with BANK_COLUMNS into a BankQuestion (the embedded key is flattened in). */
export function toBankQuestion<T extends Record<string, unknown>>(row: T): Omit<T, "question_answers"> & Pick<BankQuestion, "correct_option" | "explanation"> {
  const { question_answers: embed, ...rest } = row as T & { question_answers?: AnswerEmbed | AnswerEmbed[] | null };
  const answer = Array.isArray(embed) ? embed[0] : embed;
  const letter = typeof answer?.correct_option === "string" ? answer.correct_option.trim().toUpperCase() : "";
  const text = typeof answer?.explanation === "string" && answer.explanation.trim() ? answer.explanation : null;
  return {
    ...rest,
    correct_option: letter === "A" || letter === "B" || letter === "C" || letter === "D" ? letter : null,
    explanation: text,
  } as Omit<T, "question_answers"> & Pick<BankQuestion, "correct_option" | "explanation">;
}

/** Saves (or replaces) the answer key of one question. Returns the error message, or null on success. */
export async function saveAnswerKey(
  supabaseClient: typeof import("@/lib/supabaseClient").supabase,
  questionId: string,
  correct: Opt,
  explanation: string | null,
): Promise<string | null> {
  const { error } = await supabaseClient
    .from("question_answers")
    .upsert({ question_id: questionId, correct_option: correct, explanation }, { onConflict: "question_id" });
  return error ? error.message : null;
}

export const BANK_PAGE_SIZE = 25;

/** The text of option A, B, C or D for a question. */
export function optionText(question: BankQuestion, opt: Opt): string {
  return question[`option_${opt.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d"];
}

/** Shortens text for the audit log so one entry stays small. */
export function clip(text: string | null, max = 120): string {
  const value = text ?? "";
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

/** True when a request failed only because the questions.topic column has not been added yet. */
export function isMissingTopicColumn(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false;
  const message = error.message ?? "";
  return /topic/i.test(message) && (error.code === "PGRST204" || error.code === "42703" || /column/i.test(message));
}

/** The next free position in a module: one after the highest, so deleted questions never cause a repeat. */
export async function nextQuestionPosition(
  supabaseClient: typeof import("@/lib/supabaseClient").supabase,
  quizId: string,
): Promise<number> {
  const { data } = await supabaseClient
    .from("questions")
    .select("position")
    .eq("quiz_id", quizId)
    .order("position", { ascending: false, nullsFirst: false })
    .limit(1);
  return ((data?.[0]?.position as number | null | undefined) ?? 0) + 1;
}
