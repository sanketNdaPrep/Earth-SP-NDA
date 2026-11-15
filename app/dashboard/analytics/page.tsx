"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid, type StatItem } from "@/components/ui/stats-grid";
import { RadialProgress } from "@/components/ui/radial-progress";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { formatMinutes, type ModuleStatus } from "@/components/dashboard/insights";
import { useDashboardInsights } from "@/components/dashboard/use-dashboard-insights";

const STATUS_BADGE: Record<ModuleStatus, { variant: "emerald" | "gold" | "danger"; label: string }> = {
  strong: { variant: "emerald", label: "Strong" },
  moderate: { variant: "gold", label: "Moderate" },
  weak: { variant: "danger", label: "Needs Practice" },
};

const ACCURACY_TEXT: Record<ModuleStatus, string> = {
  strong: "text-emerald-300",
  moderate: "text-gold-300",
  weak: "text-danger-400",
};

export default function AnalyticsPage() {
  const data = useDashboardInsights();
  const ready = data.status === "ready" ? data : null;
  const insights = ready?.insights ?? null;

  const stats: StatItem[] = [
    {
      id: "1",
      title: "Overall Accuracy",
      value: insights?.overallAccuracy == null ? "-" : `${insights.overallAccuracy}%`,
      description: insights ? (insights.overallAccuracy == null ? "Take a test to see this" : "Across all tests and modules") : "Loading your results",
      icon: "checkCircle",
    },
    {
      id: "2",
      title: "Total Study Time",
      value: insights ? formatMinutes(insights.studyMinutes) : "-",
      description: insights ? `${formatMinutes(insights.studyMinutesMonth)} logged this month` : "Loading your results",
      icon: "book",
    },
    {
      id: "3",
      title: "Average Mock Score",
      value: insights?.averageMock == null ? "-" : `${insights.averageMock}%`,
      description: insights ? (insights.mockCount === 0 ? "No mocks taken yet" : `Across ${insights.mockCount} mock test${insights.mockCount === 1 ? "" : "s"}`) : "Loading your results",
      icon: "target",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Deep Performance Insights</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-steel-300">
          Accuracy by subject and module, built from the tests you take and the study sessions you log.
        </p>
      </div>

      {data.status === "error" ? (
        <p role="alert" className="rounded-panel border border-danger-400/40 bg-danger-400/10 p-4 text-sm text-danger-400">
          Your analytics could not be loaded: {data.message}
        </p>
      ) : null}

      <StatsGrid stats={stats} label="Performance Overview Metrics" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject Accuracy Gauges</CardTitle>
        </CardHeader>
        <CardContent>
          {data.status === "loading" ? (
            <SkeletonGroup label="Loading subject accuracy" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-40 rounded-control" />
              <Skeleton className="h-40 rounded-control" />
            </SkeletonGroup>
          ) : null}
          {insights && insights.subjectStats.length === 0 ? (
            <p className="text-sm text-steel-300">
              No practice modules finished yet.{" "}
              <Link href="/quizzes" className="font-semibold text-gold-300 underline-offset-4 hover:underline">
                Start a practice module
              </Link>{" "}
              to see accuracy by subject.
            </p>
          ) : null}
          {insights && insights.subjectStats.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {insights.subjectStats.map((item) => (
                <div key={item.name} className="flex flex-col items-center justify-center rounded-control border border-steel-700/60 bg-navy-950 p-6 text-center">
                  <RadialProgress value={Math.round(item.accuracy)} size="md" />
                  <span className="mt-3 text-sm font-bold text-white">{item.name}</span>
                  <span className="mt-1 font-mono text-xs text-steel-400">
                    {item.attempts} attempt{item.attempts === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module Strength Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {data.status === "loading" ? <Skeleton className="h-32 w-full rounded-control" /> : null}
          {insights && insights.modules.length === 0 ? (
            <div className="space-y-3 text-sm text-steel-300">
              <p>No mocks taken yet. Your strongest and weakest modules will show here after your first test.</p>
              <Link href="/quizzes">
                <Button variant="primary" size="sm">Open the Test Center</Button>
              </Link>
            </div>
          ) : null}
          {insights && insights.modules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-steel-700 bg-navy-950 font-mono uppercase text-steel-400">
                  <tr>
                    <th className="p-3">Module</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Attempts</th>
                    <th className="p-3">Questions Solved</th>
                    <th className="p-3">Accuracy</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-700/50">
                  {insights.modules.map((row) => (
                    <tr key={row.id} className="hover:bg-navy-800/40">
                      <td className="p-3 font-semibold text-white">{row.title}</td>
                      <td className="p-3 font-mono text-gold-300">{row.subjectLabel}</td>
                      <td className="p-3 font-mono text-steel-300">{row.attempts}</td>
                      <td className="p-3 font-mono text-steel-300">{row.questions}</td>
                      <td className={`p-3 font-mono font-bold ${ACCURACY_TEXT[row.status]}`}>{row.accuracy}%</td>
                      <td className="p-3">
                        <Badge variant={STATUS_BADGE[row.status].variant}>{STATUS_BADGE[row.status].label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
