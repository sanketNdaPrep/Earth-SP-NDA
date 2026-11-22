"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OPTION_LETTERS, type OptionLetter } from "@/lib/pdf-questions";
import { questionProblems, TAG_MAX, type BuilderQuestion } from "@/lib/test-questions";
import { cn } from "@/lib/utils";

const AREA =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 " +
  "transition-colors duration-(--duration-base) ease-(--ease-standard) " +
  "focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40";

interface Props {
  index: number;
  total: number;
  question: BuilderQuestion;
  open: boolean;
  onToggle: () => void;
  onChange: (next: BuilderQuestion) => void;
  onMove: (by: -1 | 1) => void;
  onRemove: () => void;
  onAddBelow: () => void;
  moduleName?: string;
}

/** One question in the test builder: a summary row that opens into an editor, with a student-style preview. */
export function QuestionEditor({ index, total, question: q, open, onToggle, onChange, onMove, onRemove, onAddBelow, moduleName }: Props) {
  const [preview, setPreview] = React.useState(false);
  const problems = questionProblems(q);
  const id = `q-${q.key}`;
  const set = (patch: Partial<BuilderQuestion>) => onChange({ ...q, ...patch, flags: [] });
  const setOption = (letter: OptionLetter, value: string) => set({ options: { ...q.options, [letter]: value } });

  const status =
    problems.length > 0 ? (
      <Badge variant="danger">Needs work</Badge>
    ) : q.flags.length > 0 ? (
      <Badge variant="gold">Check this</Badge>
    ) : q.owned ? (
      <Badge variant="emerald">Ready</Badge>
    ) : (
      <Badge variant="outline">From bank</Badge>
    );

  return (
    <li className={cn("rounded-control border bg-navy-950", problems.length > 0 || q.flags.length > 0 ? "border-gold-400/40" : "border-steel-700/60")}>
      <div className="flex items-start gap-3 p-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-800 font-mono text-xs font-bold text-gold-300">{index + 1}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-body`}
          className="min-w-0 flex-1 space-y-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
        >
          <span className="flex flex-wrap items-center gap-2">
            {status}
            {q.tag ? <Badge variant="outline">{q.tag}</Badge> : null}
            {moduleName ? <Badge variant="outline">{moduleName}</Badge> : null}
          </span>
          <span className="line-clamp-2 block text-sm text-steel-100">{q.text.trim() || "Empty question. Open it to write the question."}</span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-8" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move question ${index + 1} up`}>
            <Icons.chevronRight className="size-4 -rotate-90" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" disabled={index === total - 1} onClick={() => onMove(1)} aria-label={`Move question ${index + 1} down`}>
            <Icons.chevronRight className="size-4 rotate-90" />
          </Button>
        </div>
      </div>

      {open ? (
        <div id={`${id}-body`} className="space-y-4 border-t border-steel-700/60 p-3">
          {q.flags.length > 0 ? (
            <ul className="space-y-1 rounded-control border border-gold-400/30 bg-gold-400/5 p-3 text-xs text-gold-300">
              {q.flags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          ) : null}

          {!q.owned ? (
            <p className="text-xs text-steel-300">
              This question comes from the shared question bank. Edit it in the Question Bank; here you can only move it or take it out of this test.
            </p>
          ) : (
            <>
              <div className="flex gap-2" role="group" aria-label="Edit or preview">
                <Button type="button" size="sm" variant={preview ? "outline" : "primary"} onClick={() => setPreview(false)}>
                  Edit
                </Button>
                <Button type="button" size="sm" variant={preview ? "primary" : "outline"} onClick={() => setPreview(true)}>
                  <Icons.eye className="size-4" />
                  Preview as student
                </Button>
              </div>

              {preview ? (
                <StudentPreview q={q} number={index + 1} />
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`${id}-text`}>Question</Label>
                    <textarea id={`${id}-text`} rows={4} className={AREA} value={q.text} onChange={(e) => set({ text: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {OPTION_LETTERS.map((letter) => (
                      <div key={letter} className="space-y-1.5">
                        <Label htmlFor={`${id}-${letter}`}>Option {letter}</Label>
                        <textarea id={`${id}-${letter}`} rows={2} className={AREA} value={q.options[letter]} onChange={(e) => setOption(letter, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <fieldset className="space-y-1.5">
                    <legend className="text-sm font-medium text-steel-100">Correct option</legend>
                    <div className="flex flex-wrap gap-2">
                      {OPTION_LETTERS.map((letter) => (
                        <label
                          key={letter}
                          className={cn(
                            "flex h-10 min-w-12 cursor-pointer items-center justify-center rounded-control border px-4 text-sm font-semibold",
                            q.correct === letter ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-steel-700 text-steel-300 hover:border-steel-500",
                          )}
                        >
                          <input type="radio" name={`${id}-correct`} value={letter} checked={q.correct === letter} onChange={() => set({ correct: letter })} className="sr-only" />
                          {letter}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="space-y-1.5">
                    <Label htmlFor={`${id}-why`}>Explanation (shown to students after the test)</Label>
                    <textarea id={`${id}-why`} rows={3} className={AREA} value={q.explanation} onChange={(e) => set({ explanation: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`${id}-tag`}>Label (optional)</Label>
                    <Input id={`${id}-tag`} maxLength={TAG_MAX} value={q.tag} onChange={(e) => set({ tag: e.target.value })} placeholder="Statement-Based" />
                  </div>
                  {problems.length > 0 ? (
                    <ul role="status" className="space-y-1 text-xs text-danger-400">
                      {problems.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-steel-700/40 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onAddBelow}>
              <Icons.plus className="size-4" />
              Add a question below
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onRemove} aria-label={`Delete question ${index + 1}`}>
              {q.owned ? "Delete question" : "Remove from test"}
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

/** The question as a student sees it while taking the test, plus the answer the student sees after. */
function StudentPreview({ q, number }: { q: BuilderQuestion; number: number }) {
  return (
    <div className="space-y-3 rounded-control border border-steel-700/60 bg-navy-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">Question {number}</p>
      <p className="whitespace-pre-line text-sm font-medium text-white">{q.text || "(no question text)"}</p>
      <ul className="space-y-2">
        {OPTION_LETTERS.map((letter) => (
          <li
            key={letter}
            className={cn(
              "flex gap-3 rounded-control border p-3 text-sm",
              q.correct === letter ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200" : "border-steel-700 text-steel-100",
            )}
          >
            <span className="font-mono font-bold">{letter}</span>
            <span className="min-w-0 whitespace-pre-line">{q.options[letter] || "(empty)"}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-steel-300">
        <span className="font-semibold text-emerald-300">{q.correct ? `Correct: ${q.correct}.` : "No correct option chosen."}</span>{" "}
        {q.explanation ? <span className="whitespace-pre-line">{q.explanation}</span> : "No explanation."}
      </p>
    </div>
  );
}
