"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { buildQuestion, MENTOR_LIMITS, MENTOR_TEXT_MAX, MENTOR_TOPICS, questionProblem, type MentorTopic } from "@/lib/mentor";
import { supabase } from "@/lib/supabaseClient";

interface Question {
  id: string;
  query_text: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  resolved_at: string | null;
}

const COLUMNS = "id, query_text, status, admin_response, created_at, resolved_at";
const inputClass =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-steel-300";

function day(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Students ask a mentor a question and read the reply here. Admins answer from the Admin Suite. */
export default function MentorPage() {
  const [questions, setQuestions] = React.useState<Question[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [topic, setTopic] = React.useState<MentorTopic>("Study plan");
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [msg, setMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("student_queries")
      .select(COLUMNS)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) return setLoadError(error.message);
        setLoadError(null);
        setQuestions((data ?? []) as Question[]);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const problem = questionProblem(text);
    if (problem) return setMsg({ type: "error", text: problem });

    setSending(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setSending(false);
      return setMsg({ type: "error", text: "Please log in again to ask a question." });
    }
    const name = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
    const { error } = await supabase.from("student_queries").insert({
      student_id: user.id,
      student_name: name,
      student_email: user.email ?? null,
      query_text: buildQuestion(topic, text),
    });
    setSending(false);
    if (error) return setMsg({ type: "error", text: error.message });
    setText("");
    setMsg({ type: "success", text: "Sent. A mentor will reply on this page." });
    setVersion((v) => v + 1);
  };

  const waiting = (questions ?? []).filter((q) => q.status !== "resolved").length;

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Personal Guidance</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Ask a Mentor</h1>
        <p className="mt-1 max-w-2xl text-sm text-steel-300">
          Stuck on a topic, unsure about your study plan, or preparing for SSB? Ask here and a mentor will reply on this page.
        </p>
      </div>

      {msg ? (
        <div
          role={msg.type === "error" ? "alert" : "status"}
          className={`flex max-w-3xl items-start gap-2 rounded-control border p-3 text-xs ${
            msg.type === "success" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-danger-500/40 bg-danger-500/10 text-danger-400"
          }`}
        >
          {msg.type === "success" ? <Icons.checkCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Icons.info className="mt-0.5 size-4 shrink-0" aria-hidden />}
          <span>{msg.text}</span>
        </div>
      ) : null}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Your question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={send} className="space-y-4">
            <div className="space-y-1 sm:max-w-xs">
              <label htmlFor="mentor-topic" className={labelClass}>Topic</label>
              <Select id="mentor-topic" value={topic} onChange={(e) => setTopic(e.target.value as MentorTopic)}>
                {MENTOR_TOPICS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="mentor-text" className={labelClass}>What do you want help with?</label>
              <textarea
                id="mentor-text"
                rows={5}
                maxLength={MENTOR_TEXT_MAX}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Be specific. For example: I score 40% in trigonometry even after revising. What should I change?"
                className={inputClass}
              />
              <p className="text-xs text-steel-500">
                {text.trim().length} / {MENTOR_TEXT_MAX}. You can have up to {MENTOR_LIMITS.pendingMax} questions waiting at once.
              </p>
            </div>
            <Button type="submit" variant="gold" disabled={sending || waiting >= MENTOR_LIMITS.pendingMax}>
              {sending ? "Sending..." : "Send to mentor"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Your questions</CardTitle>
          {questions ? <Badge variant="outline">{waiting} waiting</Badge> : null}
        </CardHeader>
        <CardContent>
          {loadError ? <p role="alert" className="text-xs text-danger-400">Could not load your questions: {loadError}</p> : null}
          {!questions && !loadError ? <Skeleton aria-hidden="true" className="h-24 w-full rounded-panel" /> : null}
          {questions && questions.length === 0 ? <p className="text-sm text-steel-300">You have not asked anything yet.</p> : null}
          {questions && questions.length > 0 ? (
            <ul className="divide-y divide-steel-700/50">
              {questions.map((q) => (
                <li key={q.id} className="space-y-3 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="whitespace-pre-wrap text-sm text-white">{q.query_text}</p>
                    <Badge variant={q.status === "resolved" ? "emerald" : "outline"}>{q.status === "resolved" ? "Answered" : "Waiting"}</Badge>
                  </div>
                  <p className="font-mono text-xs text-steel-500">Asked {day(q.created_at)}</p>
                  {q.admin_response ? (
                    <div className="rounded-control border border-gold-400/30 bg-navy-950 p-3">
                      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">
                        Mentor reply{q.resolved_at ? `, ${day(q.resolved_at)}` : ""}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-steel-100">{q.admin_response}</p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
