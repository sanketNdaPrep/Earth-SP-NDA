"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid, type StatItem } from "@/components/ui/stats-grid";

const RESULT_STATS: StatItem[] = [
  { id: "1", title: "Score Secured", value: "246 / 300", description: "Passing Threshold: 180 Marks", icon: "target", trend: { direction: "up", text: "Passed" } },
  { id: "2", title: "Accuracy", value: "82%", description: "98 Correct / 120 Attempted", icon: "checkCircle" },
  { id: "3", title: "Percentile", value: "94.2", description: "Top candidate cohort", icon: "sigma", trend: { direction: "up", text: "Top 5%" } },
];

export default function MockTestResultPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="emerald" className="mb-2">Exam Result Calculated</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white">Performance Summary</h1>
          <p className="mt-1 text-sm text-steel-300">
            NDA Mathematics Full Paper 01 // Result Breakdown & Solutions
          </p>
        </div>
        <Link href="/dashboard/mocks">
          <Button variant="outline">Back to Mocks</Button>
        </Link>
      </div>

      <StatsGrid stats={RESULT_STATS} label="Mock Test Result Metrics" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Solution Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-control border border-steel-700/60 bg-navy-950 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Badge variant="emerald">Correct (+2.5)</Badge>
              <span className="text-steel-400">Topic: Matrices & Determinants</span>
            </div>
            <p className="font-medium text-white">
              Q1: If A is a square matrix of order 3 and |A| = 5, then what is the value of |adj(A)|?
            </p>
            <div className="text-xs text-emerald-300 font-mono">Your Answer: 25 (Correct)</div>
            <p className="text-xs text-steel-300 bg-navy-900 p-3 rounded-control mt-2 border border-steel-700/40">
              Explanation: |adj(A)| = |A|^(n-1). Here n = 3, so |adj(A)| = 5^(3-1) = 5² = 25.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}