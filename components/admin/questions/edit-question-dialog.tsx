"use client";

import * as React from "react";
import { OPTS } from "@/components/admin/seed/data";
import type { Opt } from "@/components/admin/seed/types";
import { checkQuestion, firstFailure, LIMITS } from "@/components/admin/seed/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { logAdminAction } from "@/lib/adminLog";
import { clip, type BankQuestion } from "@/lib/questionBank";
import { supabase } from "@/lib/supabaseClient";

interface EditQuestionDialogProps {
  /** The question being edited. Null keeps the dialog closed. */
  question: BankQuestion | null;
  moduleTitle: string;
  onClose: () => void;
  /** Called after the change is saved. */
  onSaved: (message: string) => void;
}

const textareaClass =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 " +
  "focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40";

/** Edit form for one stored question. Saves the change and writes it to the audit log. */
export function EditQuestionDialog({ question, moduleTitle, onClose, onSaved }: EditQuestionDialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const open = question !== null;

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="edit-question-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-full max-w-2xl rounded-panel border border-steel-700 bg-navy-900 p-0 text-steel-100 shadow-panel backdrop:bg-navy-950/80"
    >
      {question ? (
        <EditQuestionForm key={question.id} question={question} moduleTitle={moduleTitle} onClose={onClose} onSaved={onSaved} />
      ) : null}
    </dialog>
  );
}

function EditQuestionForm({
  question,
  moduleTitle,
  onClose,
  onSaved,
}: {
  question: BankQuestion;
  moduleTitle: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [text, setText] = React.useState(question.question_text);
  const [options, setOptions] = React.useState<Record<Opt, string>>({
    A: question.option_a,
    B: question.option_b,
    C: question.option_c,
    D: question.option_d,
  });
  const [correct, setCorrect] = React.useState<Opt>(question.correct_option);
  const [explanation, setExplanation] = React.useState(question.explanation ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const checks = checkQuestion({ question: text, options, correct, explanation });
  const warnings = checks.filter((c) => c.state === "warn");
  const blocking = firstFailure(checks);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (blocking) {
      setError(blocking);
      return;
    }

    const next = {
      question_text: text.trim(),
      option_a: options.A.trim(),
      option_b: options.B.trim(),
      option_c: options.C.trim(),
      option_d: options.D.trim(),
      correct_option: correct,
      explanation: explanation.trim() || null,
    };

    // Work out exactly what changed, so the log can say so.
    const before: Record<keyof typeof next, string | null> = {
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option,
      explanation: question.explanation,
    };
    const changed = (Object.keys(next) as (keyof typeof next)[]).filter((key) => next[key] !== before[key]);
    if (changed.length === 0) {
      setError("Nothing has changed yet.");
      return;
    }

    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("questions")
      .update(next)
      .eq("id", question.id)
      .select("id");
    setSaving(false);

    if (updateError || !data?.length) {
      setError(updateError?.message ?? "The question was not saved. You may not have permission.");
      return;
    }

    const changes: Record<string, { from: string; to: string }> = {};
    for (const key of changed) changes[key] = { from: clip(before[key]), to: clip(next[key]) };

    await logAdminAction({
      action: "edited",
      entityType: "question",
      label: `Question #${question.position ?? "?"} in ${moduleTitle}`,
      details: { quiz_id: question.quiz_id, question_id: question.id, changed, changes },
    });

    onSaved(`Question #${question.position ?? "?"} in ${moduleTitle} was updated.`);
  };

  return (
    <form onSubmit={save} className="space-y-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="edit-question-title" className="text-lg font-bold text-white">
            Edit question #{question.position ?? "?"}
          </h2>
          <p className="truncate text-xs text-steel-300">{moduleTitle}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-q-text">Question</Label>
        <textarea
          id="edit-q-text"
          required
          rows={4}
          maxLength={LIMITS.questionMax * 2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={textareaClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OPTS.map((opt) => (
          <div key={opt} className="space-y-1.5">
            <Label htmlFor={`edit-q-opt-${opt}`}>Option {opt}</Label>
            <Input
              id={`edit-q-opt-${opt}`}
              required
              value={options[opt]}
              onChange={(e) => setOptions((o) => ({ ...o, [opt]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5 sm:max-w-xs">
        <Label htmlFor="edit-q-correct">Correct answer</Label>
        <Select id="edit-q-correct" value={correct} onChange={(e) => setCorrect(e.target.value as Opt)}>
          {OPTS.map((opt) => (
            <option key={opt} value={opt}>
              Option {opt}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-q-explanation">Solution / explanation</Label>
        <textarea
          id="edit-q-explanation"
          rows={4}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain the steps (optional but recommended)"
          className={textareaClass}
        />
      </div>

      {warnings.length > 0 ? (
        <ul className="space-y-1 rounded-control border border-gold-400/30 bg-gold-400/5 p-3 text-xs text-gold-300">
          {warnings.map((w) => (
            <li key={w.id}>
              <span className="font-semibold">{w.label}:</span> {w.hint}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-3 border-t border-steel-700/60 pt-5">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
