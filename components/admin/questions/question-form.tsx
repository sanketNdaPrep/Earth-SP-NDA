"use client";

import * as React from "react";
import Link from "next/link";
import { OPTS, SYMBOLS, TAXONOMY } from "@/components/admin/seed/data";
import type { Opt } from "@/components/admin/seed/types";
import { checkQuestion, firstFailure, LIMITS } from "@/components/admin/seed/validators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { logAdminAction } from "@/lib/adminLog";
import {
  BANK_COLUMNS,
  clip,
  isMissingTopicColumn,
  nextQuestionPosition,
  type BankModule,
  type BankQuestion,
} from "@/lib/questionBank";
import { supabase } from "@/lib/supabaseClient";

type FieldKey = "question" | "explanation" | Opt;
type Options = Record<Opt, string>;

const EMPTY_OPTIONS: Options = { A: "", B: "", C: "", D: "" };
const GROUPS = Object.keys(TAXONOMY);

const textareaClass =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 " +
  "focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40";

/** The exam stream a stored topic belongs to. */
function groupOf(topic: string | null | undefined): string {
  if (!topic) return GROUPS[0];
  return GROUPS.find((g) => TAXONOMY[g].includes(topic)) ?? GROUPS[0];
}

type LoadState = "loading" | "ready" | "missing" | "error";
type Banner = { type: "success" | "error" | "info"; text: string };

interface QuestionFormProps {
  /** Set to edit an existing question. Leave out to add a new one. */
  questionId?: string;
}

/** The Add / Edit Question form of the Question Seeding Portal. */
export function QuestionForm({ questionId }: QuestionFormProps) {
  const editing = Boolean(questionId);

  const [loadState, setLoadState] = React.useState<LoadState>("loading");
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [modules, setModules] = React.useState<BankModule[]>([]);
  const [topicSupported, setTopicSupported] = React.useState(true);
  const [original, setOriginal] = React.useState<(BankQuestion & { topic: string | null }) | null>(null);

  const [group, setGroup] = React.useState(GROUPS[0]);
  const [topic, setTopic] = React.useState(TAXONOMY[GROUPS[0]][0]);
  const [quizId, setQuizId] = React.useState("");
  const [text, setText] = React.useState("");
  const [options, setOptions] = React.useState<Options>(EMPTY_OPTIONS);
  const [correct, setCorrect] = React.useState<Opt | null>(null);
  const [explanation, setExplanation] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [banner, setBanner] = React.useState<Banner | null>(null);
  const [savedCount, setSavedCount] = React.useState(0);

  const questionRef = React.useRef<HTMLTextAreaElement>(null);
  const lastField = React.useRef<{ el: HTMLInputElement | HTMLTextAreaElement; key: FieldKey } | null>(null);

  // Load the modules, check whether topics can be stored, and (when editing) the question itself.
  React.useEffect(() => {
    let active = true;
    (async () => {
      const probe = await supabase.from("questions").select("topic").limit(1);
      const topicOk = !isMissingTopicColumn(probe.error);

      const moduleResult = await supabase.from("quizzes").select("id, title, category").order("title", { ascending: true });
      if (!active) return;
      if (moduleResult.error) {
        setLoadError(moduleResult.error.message);
        setLoadState("error");
        return;
      }
      const list = (moduleResult.data ?? []) as BankModule[];
      setModules(list);
      setTopicSupported(topicOk);

      if (!questionId) {
        setQuizId(list[0]?.id ?? "");
        setLoadState("ready");
        return;
      }

      const columns = topicOk ? `${BANK_COLUMNS}, topic` : BANK_COLUMNS;
      const rowResult = await supabase.from("questions").select(columns).eq("id", questionId).maybeSingle();
      if (!active) return;
      if (rowResult.error) {
        setLoadError(rowResult.error.message);
        setLoadState("error");
        return;
      }
      if (!rowResult.data) {
        setLoadState("missing");
        return;
      }
      const row = rowResult.data as unknown as BankQuestion & { topic?: string | null };
      const stored = { ...row, topic: row.topic ?? null };
      setOriginal(stored);
      setGroup(groupOf(stored.topic));
      setTopic(stored.topic ?? "");
      setQuizId(stored.quiz_id);
      setText(stored.question_text);
      setOptions({ A: stored.option_a, B: stored.option_b, C: stored.option_c, D: stored.option_d });
      setCorrect(stored.correct_option);
      setExplanation(stored.explanation ?? "");
      setLoadState("ready");
    })();
    return () => {
      active = false;
    };
  }, [questionId]);

  const moduleTitle = React.useCallback(
    (id: string) => modules.find((m) => m.id === id)?.title ?? "Unknown module",
    [modules],
  );

  const checks = checkQuestion({ question: text, options, correct, explanation });
  const warnings = checks.filter((c) => c.state === "warn");
  const blocking = quizId ? firstFailure(checks) : "Choose the test module this question belongs to.";

  const setField = (key: FieldKey, value: string) => {
    if (key === "question") setText(value);
    else if (key === "explanation") setExplanation(value);
    else setOptions((prev) => ({ ...prev, [key]: value }));
  };

  /** Puts a symbol at the cursor of the field that was used last (the question by default). */
  const insertSymbol = (symbol: string) => {
    const target = lastField.current ?? (questionRef.current ? { el: questionRef.current, key: "question" as FieldKey } : null);
    if (!target) return;
    const { el, key } = target;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    setField(key, el.value.slice(0, start) + symbol + el.value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + symbol.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const selectGroup = (name: string) => {
    setGroup(name);
    setTopic(TAXONOMY[name][0]);
  };

  const topicChoices = TAXONOMY[group] ?? [];
  const topicIsCustom = topic !== "" && !topicChoices.includes(topic);

  const resetForNext = () => {
    setText("");
    setOptions(EMPTY_OPTIONS);
    setCorrect(null);
    setExplanation("");
    lastField.current = null;
    requestAnimationFrame(() => questionRef.current?.focus());
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setBanner(null);
    if (blocking || !correct) {
      setBanner({ type: "error", text: blocking ?? "Mark the correct option." });
      return;
    }

    const fields = {
      question_text: text.trim(),
      option_a: options.A.trim(),
      option_b: options.B.trim(),
      option_c: options.C.trim(),
      option_d: options.D.trim(),
      correct_option: correct,
      explanation: explanation.trim() || null,
    };
    const topicValue = topic.trim() || null;
    const moduleName = moduleTitle(quizId);

    if (!editing || !original) {
      setSaving(true);
      const position = await nextQuestionPosition(supabase, quizId);
      const row: Record<string, string | number | null> = { quiz_id: quizId, ...fields, position };
      let topicStored = topicSupported && topicValue !== null;
      let result = await supabase.from("questions").insert(topicStored ? { ...row, topic: topicValue } : row).select("id");
      if (result.error && topicStored && isMissingTopicColumn(result.error)) {
        topicStored = false;
        setTopicSupported(false);
        result = await supabase.from("questions").insert(row).select("id");
      }
      setSaving(false);

      if (result.error || !result.data?.length) {
        setBanner({ type: "error", text: `The question was not saved: ${result.error?.message ?? "you may not have permission"}.` });
        return;
      }

      await logAdminAction({
        action: "added",
        entityType: "question",
        label: `Question #${position} in ${moduleName}`,
        details: { quiz_id: quizId, question_id: result.data[0].id, position, topic: topicStored ? topicValue : null },
      });

      setSavedCount((n) => n + 1);
      setBanner({
        type: "success",
        text:
          `Question #${position} was published in ${moduleName}.` +
          (topicValue && !topicStored ? " The topic was not stored yet: run migration 005 in Supabase." : ""),
      });
      resetForNext();
      return;
    }

    // Editing: work out exactly what changed, so the log can say so.
    const next: Record<string, string | null> = { ...fields };
    const before: Record<string, string | null> = {
      question_text: original.question_text,
      option_a: original.option_a,
      option_b: original.option_b,
      option_c: original.option_c,
      option_d: original.option_d,
      correct_option: original.correct_option,
      explanation: original.explanation,
    };
    if (quizId !== original.quiz_id) {
      next.quiz_id = quizId;
      before.quiz_id = original.quiz_id;
    }
    if (topicSupported && topicValue !== original.topic) {
      next.topic = topicValue;
      before.topic = original.topic;
    }
    const changed = Object.keys(next).filter((key) => next[key] !== before[key]);
    if (changed.length === 0) {
      setBanner({ type: "error", text: "Nothing has changed yet." });
      return;
    }

    setSaving(true);
    const update: Record<string, string | number | null> = { ...next };
    if (quizId !== original.quiz_id) update.position = await nextQuestionPosition(supabase, quizId);
    const { data, error } = await supabase.from("questions").update(update).eq("id", original.id).select(BANK_COLUMNS);
    setSaving(false);

    if (error || !data?.length) {
      setBanner({ type: "error", text: `The changes were not saved: ${error?.message ?? "you may not have permission"}.` });
      return;
    }

    const saved = data[0] as unknown as BankQuestion;
    const changes: Record<string, { from: string; to: string }> = {};
    for (const key of changed) changes[key] = { from: clip(before[key]), to: clip(next[key]) };
    await logAdminAction({
      action: "edited",
      entityType: "question",
      label: `Question #${saved.position ?? "?"} in ${moduleName}`,
      details: { quiz_id: saved.quiz_id, question_id: saved.id, changed, changes },
    });

    setOriginal({ ...saved, topic: topicSupported ? topicValue : original.topic });
    setBanner({ type: "success", text: `Question #${saved.position ?? "?"} in ${moduleName} was updated.` });
  };

  if (loadState === "loading") {
    return (
      <SkeletonGroup label="Loading the question form" className="space-y-6">
        <Skeleton className="h-10 w-72 rounded-control" />
        <Skeleton className="h-40 w-full rounded-panel" />
        <Skeleton className="h-64 w-full rounded-panel" />
      </SkeletonGroup>
    );
  }

  if (loadState === "error" || loadState === "missing") {
    return (
      <Card>
        <CardContent className="space-y-4 py-10 text-center">
          <p className="text-lg font-bold text-white">
            {loadState === "missing" ? "That question was not found" : "The form could not be loaded"}
          </p>
          <p role={loadState === "error" ? "alert" : undefined} className="text-sm text-steel-300">
            {loadState === "missing"
              ? "It may have been deleted. Go back to the question bank and pick another."
              : (loadError ?? "Something went wrong.")}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/questions">Back to Question Bank</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      onSubmit={save}
      className="space-y-8"
      noValidate
      onFocus={(event) => {
        // Remember the last text field, so a symbol lands where the admin was typing.
        const el = event.target;
        if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && el.dataset.field) {
          lastField.current = { el, key: el.dataset.field as FieldKey };
        }
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="gold" className="mb-2">Question Seeding Portal</Badge>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-white">
            {editing ? "Edit Question" : "Add Question"}
          </h1>
          <p className="mt-1 text-sm text-steel-300">
            {editing
              ? `Question #${original?.position ?? "?"} in ${moduleTitle(original?.quiz_id ?? quizId)}`
              : "Fill in the question, mark the right answer, then publish it to a test module."}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/questions">Back to Question Bank</Link>
        </Button>
      </div>

      {banner ? (
        <div
          role={banner.type === "error" ? "alert" : "status"}
          className={
            banner.type === "error"
              ? "rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400"
              : "flex flex-wrap items-center justify-between gap-3 rounded-control border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs font-semibold text-emerald-300"
          }
        >
          <span>{banner.text}</span>
          {banner.type === "success" ? (
            <Link href="/admin/questions" className="underline underline-offset-2 hover:text-emerald-200">
              View question bank
            </Link>
          ) : null}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Module and Topic</CardTitle>
          <CardDescription>Where the question lives and what it covers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="q-group">Exam</Label>
              <Select id="q-group" value={group} onChange={(e) => selectGroup(e.target.value)}>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="q-topic">Subject / Topic</Label>
              <Select id="q-topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="">No topic</option>
                {topicIsCustom ? <option value={topic}>{topic}</option> : null}
                {topicChoices.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-module">Test module</Label>
            <Select id="q-module" value={quizId} onChange={(e) => setQuizId(e.target.value)} required>
              {modules.length === 0 ? <option value="">No modules yet: create one in the Seeding Portal first</option> : null}
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.category}] {m.title}
                </option>
              ))}
            </Select>
            <p className="text-xs text-steel-500">Cadets see this question inside the chosen module.</p>
          </div>
          {!topicSupported ? (
            <p className="rounded-control border border-gold-400/30 bg-gold-400/5 p-3 text-xs text-gold-300">
              Topics are not stored yet. Run migration 005 in Supabase to turn this on; everything else saves normally.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Question Statement</CardTitle>
          <CardDescription>Use the symbols below. The practice screen shows plain text, so avoid LaTeX.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div role="group" aria-label="Math symbols" className="flex flex-wrap items-center gap-1.5 rounded-control border border-steel-700/60 bg-navy-950 p-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-steel-500">Math Symbols</span>
            {SYMBOLS.map((symbol) => (
              <button
                key={symbol}
                type="button"
                aria-label={`Insert ${symbol}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertSymbol(symbol)}
                className="flex size-8 items-center justify-center rounded-control border border-steel-700 bg-navy-900 font-mono text-sm text-gold-300 transition-colors hover:border-gold-400 hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40"
              >
                {symbol}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-text">Question</Label>
            <textarea
              id="q-text"
              ref={questionRef}
              required
              rows={6}
              maxLength={LIMITS.questionMax * 2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              data-field="question"
              placeholder="If sin θ = 3/5 and θ is acute, what is cos θ?"
              className={textareaClass}
            />
            <p className="text-right text-xs tabular-nums text-steel-500">
              {text.trim().length} / {LIMITS.questionMax}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Answer Options</CardTitle>
          <CardDescription>Fill all four, then select the radio button beside the correct answer.</CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset className="space-y-3">
            <legend className="sr-only">Answer options. Select the correct one.</legend>
            {OPTS.map((opt) => {
              const isCorrect = correct === opt;
              return (
                <div
                  key={opt}
                  className={
                    isCorrect
                      ? "flex items-center gap-3 rounded-control border border-emerald-400/50 bg-emerald-400/5 p-2 pr-3"
                      : "flex items-center gap-3 rounded-control border border-steel-700/60 bg-navy-950 p-2 pr-3"
                  }
                >
                  <input
                    type="radio"
                    name="correct-option"
                    value={opt}
                    checked={isCorrect}
                    onChange={() => {
                      setCorrect(opt);
                      setBanner((b) => (b?.type === "error" ? null : b));
                    }}
                    aria-label={`Option ${opt} is the correct answer`}
                    className="ml-1 size-4 shrink-0 accent-emerald-400"
                  />
                  <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-control bg-navy-800 font-mono text-sm font-bold text-gold-300">
                    {opt}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Label htmlFor={`q-opt-${opt}`} className="sr-only">
                      Option {opt} text
                    </Label>
                    <Input
                      id={`q-opt-${opt}`}
                      required
                      value={options[opt]}
                      onChange={(e) => setOptions((o) => ({ ...o, [opt]: e.target.value }))}
                      data-field={opt}
                      placeholder={`Option ${opt}`}
                    />
                  </div>
                  {isCorrect ? <Badge variant="emerald">Correct</Badge> : null}
                </div>
              );
            })}
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4. Solution / Explanation</CardTitle>
          <CardDescription>Optional, but cadets learn more when the steps are explained.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <Label htmlFor="q-explanation">Step-by-step reasoning</Label>
          <textarea
            id="q-explanation"
            rows={5}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            data-field="explanation"
            placeholder="cos θ = √(1 − sin²θ) = √(1 − 9/25) = 4/5."
            className={textareaClass}
          />
        </CardContent>
      </Card>

      {warnings.length > 0 ? (
        <ul className="space-y-1 rounded-control border border-gold-400/30 bg-gold-400/5 p-3 text-xs text-gold-300">
          {warnings.map((w) => (
            <li key={w.id}>
              <span className="font-semibold">{w.label}:</span> {w.hint}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-steel-700/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-steel-300" aria-live="polite">
          {blocking ? `Not ready: ${blocking}` : "Ready to save."}
          {!editing && savedCount > 0 ? ` ${savedCount} published in this session.` : ""}
        </p>
        <Button type="submit" size="lg" loading={saving} className="w-full sm:w-auto sm:min-w-56">
          {saving ? (
            editing ? "Saving..." : "Publishing..."
          ) : (
            <>
              <Icons.checkCircle className="size-4" />
              {editing ? "Save Changes" : "Publish Question"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
