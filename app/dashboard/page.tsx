"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { StatsGrid, type StatItem } from "@/components/ui/stats-grid";
import { PerformanceBento } from "@/components/ui/performance-bento";
import { formatMinutes } from "@/components/dashboard/insights";
import { useDashboardInsights } from "@/components/dashboard/use-dashboard-insights";
import { useLiveStats, type LiveStats } from "@/components/dashboard/use-live-stats";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";

/** The three tiles, from the cadet's real attempts and study logs. "-" while loading. */
function buildStats(stats: LiveStats): StatItem[] {
  const ready = stats.status === "ready" ? stats : null;
  const days = ready?.streak ?? 0;
  return [
    {
      id: "1",
      title: "Mock Accuracy",
      value: ready ? (ready.mockAccuracy === null ? "-" : `${ready.mockAccuracy}%`) : "-",
      description: ready
        ? ready.mockTests === 0
          ? "Take a mock test to see this"
          : `Across ${ready.mockTests} mock test${ready.mockTests === 1 ? "" : "s"}`
        : stats.status === "error"
          ? "Could not load your results"
          : "Loading your results",
      icon: "target",
    },
    {
      id: "2",
      title: "Best Mock Score",
      value: ready ? (ready.bestMock === null ? "-" : `${ready.bestMock}%`) : "-",
      description: "Your highest mock test",
      icon: "calculator",
    },
    {
      id: "3",
      title: "Study Streak",
      value: ready ? `${days} ${days === 1 ? "Day" : "Days"}` : "-",
      description: "In a row with a test or study session",
      icon: "checkCircle",
    },
  ];
}

const BENTO_ICONS = ["sigma", "triangle", "calculator", "target", "atom", "flask", "landmark", "globe", "book"] as const;
type BentoIcon = (typeof BENTO_ICONS)[number];
const bentoIcon = (name: string): BentoIcon => (BENTO_ICONS as readonly string[]).includes(name) ? (name as BentoIcon) : "target";

export default function DashboardPage() {
  const liveStats = useLiveStats();
  const dashboardStats = React.useMemo(() => buildStats(liveStats), [liveStats]);
  const data = useDashboardInsights();
  const ready = data.status === "ready" ? data : null;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="gold" className="mb-2">Cadet Portal Active</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, Cadet</h1>
          <p className="mt-1 text-sm text-steel-300">
            Targeting NDA Entry // Track your daily preparation milestones and mock exam scores.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/study-tracker">
            <Button variant="secondary" size="md">
              <Icons.book className="size-4" />
              Log Study Session
            </Button>
          </Link>
          <Link href="/quizzes">
            <Button variant="primary" size="md">
              <Icons.calculator className="size-4" />
              Start Mock Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <StatsGrid stats={dashboardStats} label="Cadet Overview Metrics" />

      {/* Performance Bento Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Comprehensive Performance Analytics</h2>
        {data.status === "loading" ? (
          <SkeletonGroup label="Loading your performance" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-52 rounded-panel sm:col-span-2" />
            <Skeleton className="h-52 rounded-panel" />
            <Skeleton className="h-52 rounded-panel" />
          </SkeletonGroup>
        ) : null}
        {data.status === "error" ? (
          <p role="alert" className="rounded-panel border border-danger-400/40 bg-danger-400/10 p-4 text-sm text-danger-400">
            Your performance could not be loaded: {data.message}
          </p>
        ) : null}
        {ready ? (
          <PerformanceBento
            eyebrow="Your results"
            heading="Your preparation at a glance"
            intro="Built from the tests you take and the study sessions you log."
            scores={ready.insights.mockScores}
            subjectStats={ready.insights.subjectStats}
            log={ready.insights.log.map((entry) => ({ text: entry.text, detail: entry.detail || undefined }))}
            rings={ready.insights.rings}
            daily={ready.insights.daily}
            subjects={ready.subjects.map((subject) => ({
              id: subject.id,
              name: subject.name,
              description: subject.description,
              icon: bentoIcon(subject.icon),
              href: subject.href,
            }))}
          />
        ) : null}
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Mock Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ready && ready.upcoming.length === 0 ? (
              <p className="text-sm text-steel-300">
                {ready.insights.mockCount > 0 ? "You have taken every published mock test. New ones will appear here." : "No mock tests are published yet. Check back soon."}
              </p>
            ) : null}
            {ready?.upcoming.map((test, index) => (
              <div key={test.id} className="flex items-center justify-between gap-3 border-b border-steel-700/50 pb-3 last:border-b-0 last:pb-1">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">{test.title}</div>
                  <div className="text-xs text-steel-300">
                    {test.questions} Questions // {test.totalMarks} Marks // {test.minutes} Mins
                  </div>
                </div>
                <Link href={`/quizzes/${test.id}`}>
                  <Button variant={index === 0 ? "primary" : "outline"} size="sm">Launch</Button>
                </Link>
              </div>
            ))}
            {!ready && data.status === "loading" ? <Skeleton className="h-12 w-full rounded-control" /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Study Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {ready && ready.recentStudy.length === 0 ? (
              <p className="text-steel-300">
                No study sessions logged yet.{" "}
                <Link href="/dashboard/study-tracker" className="font-semibold text-gold-300 underline-offset-4 hover:underline">
                  Log your first session
                </Link>
                .
              </p>
            ) : null}
            {ready?.recentStudy.map((log) => (
              <div key={log.id} className="flex justify-between gap-3 border-b border-steel-700/50 pb-2 last:border-b-0 last:pb-1">
                <span className="min-w-0 truncate font-medium text-white">{log.subject}</span>
                <span className="shrink-0 font-mono text-gold-300">{formatMinutes(log.minutes)}</span>
              </div>
            ))}
            {!ready && data.status === "loading" ? <Skeleton className="h-12 w-full rounded-control" /> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}