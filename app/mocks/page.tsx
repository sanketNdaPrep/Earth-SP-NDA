"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

interface MockTestCardProps {
  id: string;
  code: string;
  title: string;
  targetExam: string;
  questionsCount: number;
  durationMinutes: number;
  totalMarks: number;
  difficulty: "Standard" | "Hard" | "Exam Level";
  attempted: boolean;
  bestScore?: string;
}

const SAMPLE_MOCKS: MockTestCardProps[] = [
  {
    id: "nda-maths-01",
    code: "NDA-MTH-2027-01",
    title: "NDA Mathematics Full Paper 01",
    targetExam: "NDA / NA",
    questionsCount: 120,
    durationMinutes: 150,
    totalMarks: 300,
    difficulty: "Exam Level",
    attempted: true,
    bestScore: "246 / 300",
  },
  {
    id: "nda-gat-01",
    code: "NDA-GAT-2027-01",
    title: "General Ability Test (GAT) Full Mock 01",
    targetExam: "NDA / NA",
    questionsCount: 150,
    durationMinutes: 150,
    totalMarks: 600,
    difficulty: "Exam Level",
    attempted: false,
  },
  {
    id: "cds-eng-01",
    code: "CDS-ENG-2027-01",
    title: "CDS English Language Sectional Mock",
    targetExam: "CDS",
    questionsCount: 120,
    durationMinutes: 120,
    totalMarks: 100,
    difficulty: "Standard",
    attempted: false,
  },
  {
    id: "afcat-num-01",
    code: "AFCAT-NUM-2027-01",
    title: "AFCAT Numerical Ability & Reasoning",
    targetExam: "AFCAT",
    questionsCount: 100,
    durationMinutes: 120,
    totalMarks: 300,
    difficulty: "Standard",
    attempted: false,
  },
];

export default function MocksListPage() {
  const [filter, setFilter] = React.useState<string>("ALL");

  const filteredMocks = SAMPLE_MOCKS.filter((mock) => {
    if (filter === "ALL") return true;
    return mock.targetExam.includes(filter);
  });

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Timed Examination Series</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Mock Test Center</h1>
        <p className="mt-1 text-sm text-steel-300">
          UPSC standard timed test series with negative marking and detailed error analysis.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-steel-700/60 pb-3">
        {["ALL", "NDA", "CDS", "AFCAT"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-control px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === tab
                ? "bg-gold-400 text-navy-950"
                : "bg-navy-900 text-steel-300 hover:bg-navy-800 hover:text-white"
            }`}
          >
            {tab === "ALL" ? "All Exams" : tab}
          </button>
        ))}
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredMocks.map((test) => (
          <Card key={test.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">
                  {test.code}
                </span>
                <Badge variant={test.attempted ? "emerald" : "outline"}>
                  {test.attempted ? "Attempted" : test.difficulty}
                </Badge>
              </div>
              <CardTitle className="mt-2 text-xl">{test.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-2 rounded-control border border-steel-700/60 bg-navy-950 p-3 text-center text-xs">
                <div>
                  <div className="text-steel-500 uppercase font-semibold">Questions</div>
                  <div className="mt-1 font-mono font-bold text-white">{test.questionsCount}</div>
                </div>
                <div>
                  <div className="text-steel-500 uppercase font-semibold">Time</div>
                  <div className="mt-1 font-mono font-bold text-white">{test.durationMinutes}m</div>
                </div>
                <div>
                  <div className="text-steel-500 uppercase font-semibold">Marks</div>
                  <div className="mt-1 font-mono font-bold text-gold-300">{test.totalMarks}</div>
                </div>
              </div>

              {test.attempted && test.bestScore && (
                <div className="flex items-center justify-between rounded-control border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs">
                  <span className="text-emerald-300">Best Score Recorded:</span>
                  <span className="font-mono font-bold text-white">{test.bestScore}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                {test.attempted ? (
                  <>
                    <Link href={`/dashboard/mocks/${test.id}/result`} className="w-1/2">
                      <Button variant="outline" className="w-full">
                        View Analysis
                      </Button>
                    </Link>
                    <Link href={`/dashboard/mocks/${test.id}`} className="w-1/2">
                      <Button variant="primary" className="w-full">
                        Re-Attempt
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href={`/dashboard/mocks/${test.id}`} className="w-full">
                    <Button variant="primary" className="w-full">
                      <Icons.calculator className="size-4" />
                      Start Mock Exam
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}