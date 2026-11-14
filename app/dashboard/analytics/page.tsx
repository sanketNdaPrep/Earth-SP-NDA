"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid, type StatItem } from "@/components/ui/stats-grid";
import { RadialProgress } from "@/components/ui/radial-progress";

const ANALYTICS_STATS: StatItem[] = [
  { id: "1", title: "Overall Accuracy", value: "81.5%", description: "Across all subjects", icon: "checkCircle", trend: { direction: "up", text: "+4.2% this week" } },
  { id: "2", title: "Total Study Time", value: "48.5 hrs", description: "Logged in November", icon: "book", trend: { direction: "up", text: "On track for goal" } },
  { id: "3", title: "Average Mock Score", value: "238 / 300", description: "NDA Maths papers", icon: "target", trend: { direction: "flat", text: "Consistent percentile" } },
];

const SUBJECT_BREAKDOWN = [
  { subject: "Mathematics", accuracy: 82, hours: 22, color: "text-gold-300" },
  { subject: "English", accuracy: 76, hours: 12, color: "text-emerald-300" },
  { subject: "Physics", accuracy: 70, hours: 8, color: "text-steel-300" },
  { subject: "Chemistry", accuracy: 74, hours: 6.5, color: "text-gold-400" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Deep Performance Insights</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-steel-300">
          In-depth breakdowns of accuracy rates, topic strengths, and daily study time distribution.
        </p>
      </div>

      <StatsGrid stats={ANALYTICS_STATS} label="Performance Overview Metrics" />

      {/* Radial Accuracy Gauges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject Accuracy Gauges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SUBJECT_BREAKDOWN.map((item) => (
              <div key={item.subject} className="flex flex-col items-center justify-center rounded-control border border-steel-700/60 bg-navy-950 p-6 text-center">
                <RadialProgress value={item.accuracy} size="md" />
                <span className="mt-3 text-sm font-bold text-white">{item.subject}</span>
                <span className="mt-1 font-mono text-xs text-steel-400">{item.hours} hrs logged</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Topic-Level Strength Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-steel-700 bg-navy-950 font-mono uppercase text-steel-400">
                <tr>
                  <th className="p-3">Topic Name</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Questions Solved</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-700/50">
                <tr className="hover:bg-navy-800/40">
                  <td className="p-3 font-semibold text-white">Matrices & Determinants</td>
                  <td className="p-3 font-mono text-gold-300">Mathematics</td>
                  <td className="p-3 font-mono text-steel-300">140</td>
                  <td className="p-3 font-mono font-bold text-emerald-300">88%</td>
                  <td className="p-3"><Badge variant="emerald">Strong</Badge></td>
                </tr>
                <tr className="hover:bg-navy-800/40">
                  <td className="p-3 font-semibold text-white">Trigonometry & Ratios</td>
                  <td className="p-3 font-mono text-gold-300">Mathematics</td>
                  <td className="p-3 font-mono text-steel-300">120</td>
                  <td className="p-3 font-mono font-bold text-gold-300">79%</td>
                  <td className="p-3"><Badge variant="gold">Moderate</Badge></td>
                </tr>
                <tr className="hover:bg-navy-800/40">
                  <td className="p-3 font-semibold text-white">Newton&apos;s Laws & Mechanics</td>
                  <td className="p-3 font-mono text-gold-300">Physics</td>
                  <td className="p-3 font-mono text-steel-300">95</td>
                  <td className="p-3 font-mono font-bold text-danger-400">62%</td>
                  <td className="p-3"><Badge variant="danger">Needs Practice</Badge></td>
                </tr>
                <tr className="hover:bg-navy-800/40">
                  <td className="p-3 font-semibold text-white">Spotting Errors & Idioms</td>
                  <td className="p-3 font-mono text-gold-300">English</td>
                  <td className="p-3 font-mono text-steel-300">180</td>
                  <td className="p-3 font-mono font-bold text-emerald-300">84%</td>
                  <td className="p-3"><Badge variant="emerald">Strong</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}