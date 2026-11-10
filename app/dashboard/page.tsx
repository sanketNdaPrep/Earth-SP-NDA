"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { StatsGrid, type StatItem } from "@/components/ui/stats-grid";
import { PerformanceBento } from "@/components/ui/performance-bento";

const DASHBOARD_STATS: StatItem[] = [
  { id: "1", title: "Target Score", value: "450/600", description: "NDA Written Goal", icon: "target", trend: { direction: "up", text: "+25 pts from last mock" } },
  { id: "2", title: "Mathematics", value: "82%", description: "Accuracy (Algebra & Trig)", icon: "sigma", trend: { direction: "up", text: "5% gain" } },
  { id: "3", title: "Study Streak", value: "14 Days", description: "Daily study targets met", icon: "checkCircle" },
];

const SAMPLE_BENTO_DATA = {
  scores: [
    { label: "Mock 1", score: 60 },
    { label: "Mock 2", score: 68 },
    { label: "Mock 3", score: 75 },
    { label: "Mock 4", score: 82 },
  ],
  subjectStats: [
    { name: "Mathematics", accuracy: 82 },
    { name: "English", accuracy: 76 },
    { name: "Physics", accuracy: 70 },
    { name: "Chemistry", accuracy: 74 },
  ],
  log: [
    { text: "Attempted NDA Mathematics Mock 3", detail: "82% marks" },
    { text: "Logged 2.5h Physical Organic Chemistry study", detail: "Today" },
    { text: "Reviewed 12 incorrect answers in Trigonometry", detail: "Yesterday" },
  ],
  rings: [
    { label: "Maths", value: 82 },
    { label: "English", value: 76 },
    { label: "Science", value: 70 },
  ],
  daily: [
    { label: "Mon", count: 40 },
    { label: "Tue", count: 60 },
    { label: "Wed", count: 45 },
    { label: "Thu", count: 70 },
    { label: "Fri", count: 55 },
    { label: "Sat", count: 85 },
    { label: "Sun", count: 90 },
  ],
  subjects: [
    { id: "maths", name: "Maths", description: "Algebra, Trigonometry, Calculus.", icon: "sigma" as const },
    { id: "english", name: "English", description: "Grammar & Reading Comprehension.", icon: "book" as const },
    { id: "physics", name: "Physics", description: "Mechanics, Electricity & Magnetism.", icon: "atom" as const },
  ],
};

export default function DashboardPage() {
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
          <Link href="/dashboard/mocks">
            <Button variant="primary" size="md">
              <Icons.calculator className="size-4" />
              Start Mock Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <StatsGrid stats={DASHBOARD_STATS} label="Cadet Overview Metrics" />

      {/* Performance Bento Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Comprehensive Performance Analytics</h2>
        <PerformanceBento
          scores={SAMPLE_BENTO_DATA.scores}
          subjectStats={SAMPLE_BENTO_DATA.subjectStats}
          log={SAMPLE_BENTO_DATA.log}
          rings={SAMPLE_BENTO_DATA.rings}
          daily={SAMPLE_BENTO_DATA.daily}
          subjects={SAMPLE_BENTO_DATA.subjects}
          sample={true}
        />
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Mock Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-steel-700/50 pb-3">
              <div>
                <div className="font-semibold text-white">NDA Mathematics Full Paper 04</div>
                <div className="text-xs text-steel-300">120 Questions // 300 Marks // 150 Mins</div>
              </div>
              <Link href="/dashboard/mocks">
                <Button variant="primary" size="sm">Launch</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between pb-1">
              <div>
                <div className="font-semibold text-white">General Ability Test (GAT) Mock 03</div>
                <div className="text-xs text-steel-300">150 Questions // 600 Marks // 150 Mins</div>
              </div>
              <Link href="/dashboard/mocks">
                <Button variant="outline" size="sm">Launch</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Study Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-steel-700/50 pb-2">
              <span className="font-medium text-white">Physical Organic Chemistry</span>
              <span className="font-mono text-gold-300">120 mins</span>
            </div>
            <div className="flex justify-between border-b border-steel-700/50 pb-2">
              <span className="font-medium text-white">Higher Algebra & Real Analysis</span>
              <span className="font-mono text-gold-300">90 mins</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="font-medium text-white">English Idioms & Spotting Errors</span>
              <span className="font-mono text-gold-300">60 mins</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}