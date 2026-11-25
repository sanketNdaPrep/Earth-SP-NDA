"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { ROSTER_LIMIT, useRoster } from "@/components/admin/use-roster";
import { EXAMS, filterStudents, formatDay } from "@/lib/adminRoster";
import { Table, TableShell, TBody, Td, THead, Th, Tr } from "@/components/ui/data-table";

export default function AdminStudentsPage() {
  const { state, retry } = useRoster();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [exam, setExam] = React.useState<string | null>(null);

  const ready = state.status === "ready" ? state : null;
  const filtered = React.useMemo(() => (ready ? filterStudents(ready.students, searchTerm, exam) : []), [ready, searchTerm, exam]);

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Cadet Directory</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Student Management Roster</h1>
        <p className="mt-1 text-sm text-steel-300">
          Every registered student, grouped by the exam they are preparing for, with their test activity.
        </p>
      </div>

      {state.status === "error" ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-danger-400/40 bg-danger-400/10 p-4 text-sm text-danger-400">
          <span>The roster could not be loaded: {state.message}</span>
          <Button variant="outline" size="sm" onClick={retry}>Try again</Button>
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Registered Candidates{ready ? ` (${filtered.length})` : ""}</CardTitle>
            <input
              type="search"
              aria-label="Search candidates by name or email"
              placeholder="Search candidates by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-xs text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none sm:w-64"
            />
          </div>
          <div role="group" aria-label="Filter by target exam" className="flex flex-wrap gap-2">
            {[null, ...EXAMS].map((option) => {
              const count = option === null ? ready?.totalStudents : ready?.exams.find((item) => item.exam === option)?.enrolled;
              return (
                <button
                  key={option ?? "all"}
                  type="button"
                  aria-pressed={exam === option}
                  onClick={() => setExam(option)}
                  className={`rounded-control border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold-400 ${
                    exam === option ? "border-gold-400 bg-gold-400 text-navy-950" : "border-steel-700 text-steel-300 hover:text-white"
                  }`}
                >
                  {option ?? "All"}
                  {count === undefined ? "" : ` (${count})`}
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {state.status === "loading" ? (
            <SkeletonGroup label="Loading students" className="space-y-3">
              <Skeleton className="h-10 w-full rounded-control" />
              <Skeleton className="h-10 w-full rounded-control" />
              <Skeleton className="h-10 w-full rounded-control" />
            </SkeletonGroup>
          ) : null}
          {ready && ready.students.length === 0 ? (
            <p className="py-6 text-sm text-steel-300">No students have registered yet. New sign-ups will appear here.</p>
          ) : null}
          {ready && ready.students.length > 0 && filtered.length === 0 ? (
            <p className="py-6 text-sm text-steel-300">No candidates match that search.</p>
          ) : null}
          {filtered.length > 0 ? (
            <TableShell>
              <Table>
                <THead>
                  <Tr>
                    <Th>Candidate Name</Th>
                    <Th>Target Exam</Th>
                    <Th>Tests Taken</Th>
                    <Th>Accuracy</Th>
                    <Th>Last Test</Th>
                    <Th>Registered On</Th>
                  </Tr>
                </THead>
                <TBody>
                  {filtered.map((std) => (
                    <Tr key={std.id}>
                      <Td>
                        <div className="font-semibold text-white">{std.name}</div>
                        <div className="text-steel-500">{std.email}</div>
                      </Td>
                      <Td className="font-mono text-gold-300">{std.targetExam}</Td>
                      <Td className="font-mono text-white">{std.testsTaken}</Td>
                      <Td className="font-mono font-bold text-white">{std.accuracy === null ? "-" : `${std.accuracy}%`}</Td>
                      <Td className="text-steel-400">{formatDay(std.lastAttempt)}</Td>
                      <Td className="text-steel-400">{formatDay(std.joinedAt)}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableShell>
          ) : null}
          {ready && ready.students.length >= ROSTER_LIMIT ? (
            <p className="mt-4 text-xs text-steel-400">Showing the newest {ROSTER_LIMIT.toLocaleString("en-IN")} students. The exam counts above are exact.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
