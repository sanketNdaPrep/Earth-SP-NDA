"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { ApprovalsPanel } from "@/components/admin/approvals-panel";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { useRoster } from "@/components/admin/use-roster";
import { formatDay } from "@/lib/adminRoster";
import { Table, TableShell, TBody, Td, THead, Th, Tr } from "@/components/ui/data-table";

const RECENT_COUNT = 6;

export default function AdminOverviewPage() {
  const { state, retry } = useRoster();
  const ready = state.status === "ready" ? state : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="gold" className="mb-2">Admin Command Center</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Performance & Aspirants</h1>
          <p className="mt-1 text-sm text-steel-300">
            Monitor platform metrics, manage question banks, and review candidate activity.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/questions">
            <Button variant="primary" size="sm">
              <Icons.book className="size-4" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      <ApprovalsPanel />

      {state.status === "error" ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-danger-400/40 bg-danger-400/10 p-4 text-sm text-danger-400">
          <span>Student numbers could not be loaded: {state.message}</span>
          <Button variant="outline" size="sm" onClick={retry}>Try again</Button>
        </div>
      ) : null}

      {/* Enrolled students by target exam */}
      {state.status === "loading" ? (
        <SkeletonGroup label="Loading enrolment numbers" className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-panel" />
          <Skeleton className="h-32 rounded-panel" />
          <Skeleton className="h-32 rounded-panel" />
        </SkeletonGroup>
      ) : null}
      {ready ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ready.exams.map((stat) => (
            <Card key={stat.exam}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gold-300">{stat.exam}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-steel-300">Total Enrolled:</span>
                  <span className="font-mono font-bold text-white">{stat.enrolled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel-300">Tests Taken:</span>
                  <span className="font-mono font-bold text-white">{stat.testsTaken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-steel-300">Average Accuracy:</span>
                  <span className="font-mono font-bold text-emerald-300">{stat.accuracy === null ? "-" : `${stat.accuracy}%`}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Newest students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Recent Candidate Enrollments{ready ? ` (${ready.totalStudents} enrolled)` : ""}
          </CardTitle>
          <Link href="/admin/students">
            <Button variant="outline" size="sm">View Full Roster</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {state.status === "loading" ? <Skeleton className="h-32 w-full rounded-control" /> : null}
          {ready && ready.students.length === 0 ? (
            <p className="py-6 text-sm text-steel-300">No students have registered yet. New sign-ups will appear here.</p>
          ) : null}
          {ready && ready.students.length > 0 ? (
            <TableShell>
              <Table>
                <THead>
                  <Tr>
                    <Th>Candidate</Th>
                    <Th>Target Exam</Th>
                    <Th>Tests Taken</Th>
                    <Th>Accuracy</Th>
                    <Th>Joined Date</Th>
                  </Tr>
                </THead>
                <TBody>
                  {ready.students.slice(0, RECENT_COUNT).map((std) => (
                    <Tr key={std.id}>
                      <Td>
                        <div className="font-semibold text-white">{std.name}</div>
                        <div className="text-steel-500">{std.email}</div>
                      </Td>
                      <Td className="font-mono text-gold-300">{std.targetExam}</Td>
                      <Td className="font-mono text-white">{std.testsTaken}</Td>
                      <Td className="font-mono font-bold text-white">{std.accuracy === null ? "-" : `${std.accuracy}%`}</Td>
                      <Td className="text-steel-400">{formatDay(std.joinedAt)}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableShell>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
