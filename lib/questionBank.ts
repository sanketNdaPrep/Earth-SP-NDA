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
  correct_option: Opt;
  explanation: string | null;
  position: number | null;
  created_at: string;
}

export interface BankModule {
  id: string;
  title: string;
  category: string;
}

/** Columns the question bank reads. */
export const BANK_COLUMNS =
  "id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, position, created_at";

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
