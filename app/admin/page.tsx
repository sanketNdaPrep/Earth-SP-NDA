"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { ADMIN_STUDENTS_PREVIEW, ADMIN_EXAM_STATS_PREVIEW } from "@/lib/admin-preview-data";

export default function AdminOverviewPage() {
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

      {/* Exam Performance Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {ADMIN_EXAM_STATS_PREVIEW.map((stat) => (
          <Card key={stat.exam}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-gold-300">{stat.exam}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-steel-300">Total Enrolled:</span>
                <span className="font-mono font-bold text-white">{stat.totalEnrolled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel-300">Average Score:</span>
                <span className="font-mono font-bold text-white">{stat.avgScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-steel-300">Pass Rate:</span>
                <span className="font-mono font-bold text-emerald-300">{stat.passRate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Candidate Roster Preview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Candidate Enrollments</CardTitle>
          <Link href="/admin/students">
            <Button variant="outline" size="sm">View Full Roster</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-steel-700 bg-navy-950 font-mono text-steel-400 uppercase">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Target Exam</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-700/50">
                {ADMIN_STUDENTS_PREVIEW.map((std) => (
                  <tr key={std.id} className="hover:bg-navy-800/40">
                    <td className="p-3">
                      <div className="font-semibold text-white">{std.name}</div>
                      <div className="text-steel-500">{std.email}</div>
                    </td>
                    <td className="p-3 font-mono text-gold-300">{std.targetExam}</td>
                    <td className="p-3 font-mono font-bold text-white">{std.score}</td>
                    <td className="p-3">
                      <Badge variant={std.status === "Active" ? "emerald" : "outline"}>
                        {std.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-steel-400">{std.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}