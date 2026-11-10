"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Icons } from "@/components/ui/icons";

interface StudyLogEntry {
  id: string;
  subject: string;
  minutes: number;
  questionsSolved: number;
  notes: string;
  date: string;
}

export default function StudyTrackerPage() {
  const [subject, setSubject] = React.useState("Mathematics");
  const [minutes, setMinutes] = React.useState(60);
  const [questions, setQuestions] = React.useState(25);
  const [notes, setNotes] = React.useState("");
  const [logs, setLogs] = React.useState<StudyLogEntry[]>([
    {
      id: "log-1",
      subject: "Mathematics",
      minutes: 120,
      questionsSolved: 40,
      notes: "Practiced Integration and Matrix Determinants problems.",
      date: "Today, 4:30 PM",
    },
    {
      id: "log-2",
      subject: "Physics",
      minutes: 90,
      questionsSolved: 30,
      notes: "Optics & Newton's Laws numerical questions.",
      date: "Yesterday",
    },
  ]);

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: StudyLogEntry = {
      id: `log-${Date.now()}`,
      subject,
      minutes: Number(minutes),
      questionsSolved: Number(questions),
      notes,
      date: "Just now",
    };
    setLogs([newLog, ...logs]);
    setNotes("");
  };

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Daily Progress Tracker</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Madam Ji's Study Tracker</h1>
        <p className="mt-1 text-sm text-steel-300">
          Log study hours, track solved question counts, and maintain subject discipline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Log Entry Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Log New Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitLog} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-steel-300">Subject</label>
                <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="English">English</option>
                  <option value="General Studies">General Studies</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-steel-300">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-steel-300">Questions Solved</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={questions}
                  onChange={(e) => setQuestions(Number(e.target.value))}
                  className="w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-steel-300">Topic Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes or formula revisions..."
                  className="w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 focus:border-gold-400 focus:outline-none"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                <Icons.checkCircle className="size-4" />
                Save Log Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Session Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Session History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="rounded-control border border-steel-700/60 bg-navy-950 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.subject}</span>
                    <Badge variant="outline">{log.date}</Badge>
                  </div>
                  <div className="font-mono text-xs text-gold-300">
                    {log.minutes} mins // {log.questionsSolved} questions
                  </div>
                </div>
                {log.notes && (
                  <p className="mt-2 text-xs text-steel-300">{log.notes}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}