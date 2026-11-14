"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";

interface StudyLog {
  id: string;
  subject: string;
  minutes_studied: number;
  questions_solved: number;
  notes: string | null;
  logged_at: string;
}

const LOG_COLUMNS = "id, subject, minutes_studied, questions_solved, notes, logged_at";

const SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "General Science",
  "History",
  "Geography",
  "Polity & Economy",
  "Current Affairs",
  "Reasoning & Verbal Ability",
];

const textareaClass =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 " +
  "focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40";

const whenFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** "2h 30m" or "45m". */
function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function startOfDay(daysAgo: number): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.getTime();
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-steel-500">{label}</p>
        <p className="mt-2 font-mono text-2xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function StudyTrackerPage() {
  const [subject, setSubject] = React.useState(SUBJECTS[0]);
  const [minutes, setMinutes] = React.useState("60");
  const [questions, setQuestions] = React.useState("25");
  const [notes, setNotes] = React.useState("");

  const [logs, setLogs] = React.useState<StudyLog[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("study_logs")
      .select(LOG_COLUMNS)
      .order("logged_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setLoadError(error.message);
          setLogs([]);
          return;
        }
        setLogs((data ?? []) as StudyLog[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const totals = React.useMemo(() => {
    // Wait for the saved sessions: reading the clock earlier breaks page prerendering.
    if (!logs) return { todayMinutes: 0, weekMinutes: 0, weekQuestions: 0 };
    const list = logs;
    const today = startOfDay(0);
    const week = startOfDay(6);
    let todayMinutes = 0;
    let weekMinutes = 0;
    let weekQuestions = 0;
    for (const log of list) {
      const at = new Date(log.logged_at).getTime();
      if (at >= today) todayMinutes += log.minutes_studied;
      if (at >= week) {
        weekMinutes += log.minutes_studied;
        weekQuestions += log.questions_solved;
      }
    }
    return { todayMinutes, weekMinutes, weekQuestions };
  }, [logs]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const mins = Number(minutes);
    const solved = Number(questions);
    if (!Number.isInteger(mins) || mins < 1 || mins > 1440) {
      setMessage({ type: "error", text: "Duration must be a whole number between 1 and 1440 minutes." });
      return;
    }
    if (!Number.isInteger(solved) || solved < 0 || solved > 2000) {
      setMessage({ type: "error", text: "Questions solved must be a whole number between 0 and 2000." });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("study_logs")
      .insert({
        subject,
        minutes_studied: mins,
        questions_solved: solved,
        notes: notes.trim() || null,
      })
      .select(LOG_COLUMNS)
      .single();
    setSaving(false);

    if (error || !data) {
      setMessage({ type: "error", text: `Your session was not saved: ${error?.message ?? "no response from the server"}.` });
      return;
    }

    setLogs((prev) => [data as StudyLog, ...(prev ?? [])]);
    setNotes("");
    setMessage({ type: "success", text: `Saved: ${subject}, ${formatMinutes(mins)}.` });
  };

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Daily Progress Tracker</Badge>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white">Study Tracker</h1>
        <p className="mt-1 text-sm text-steel-300">
          Log study hours, track solved question counts, and maintain subject discipline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Tile label="Studied today" value={logs ? formatMinutes(totals.todayMinutes) : "-"} />
        <Tile label="Last 7 days" value={logs ? formatMinutes(totals.weekMinutes) : "-"} />
        <Tile label="Questions, 7 days" value={logs ? String(totals.weekQuestions) : "-"} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Log New Session</CardTitle>
            <CardDescription>Saved to your private study history.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="log-subject">Subject</Label>
                <Select id="log-subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="log-minutes">Duration (minutes)</Label>
                <Input
                  id="log-minutes"
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  max={1440}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="log-questions">Questions solved</Label>
                <Input
                  id="log-questions"
                  type="number"
                  inputMode="numeric"
                  required
                  min={0}
                  max={2000}
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="log-notes">Topic notes</Label>
                <textarea
                  id="log-notes"
                  rows={3}
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Topics covered, formulas revised..."
                  className={textareaClass}
                />
              </div>

              {message ? (
                <p
                  role={message.type === "success" ? "status" : "alert"}
                  className={
                    message.type === "success"
                      ? "rounded-control border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs font-semibold text-emerald-300"
                      : "rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400"
                  }
                >
                  {message.text}
                </p>
              ) : null}

              <Button type="submit" variant="primary" className="w-full" loading={saving}>
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Icons.checkCircle className="size-4" />
                    Save Log Entry
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Session History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadError ? (
              <p role="alert" className="text-xs text-danger-400">
                Could not load your history: {loadError}
              </p>
            ) : null}

            {logs === null ? (
              <SkeletonGroup label="Loading your sessions" className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-control" />
                ))}
              </SkeletonGroup>
            ) : null}

            {logs && logs.length === 0 && !loadError ? (
              <p className="py-6 text-center text-sm text-steel-300">
                No sessions logged yet. Save your first one with the form.
              </p>
            ) : null}

            {logs?.map((log) => (
              <div key={log.id} className="rounded-control border border-steel-700/60 bg-navy-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.subject}</span>
                    <Badge variant="outline">{whenFormat.format(new Date(log.logged_at))}</Badge>
                  </div>
                  <div className="font-mono text-xs text-gold-300">
                    {formatMinutes(log.minutes_studied)} · {log.questions_solved} questions
                  </div>
                </div>
                {log.notes ? <p className="mt-2 text-xs text-steel-300">{log.notes}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
