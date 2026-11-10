"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_STUDENTS_PREVIEW } from "@/lib/admin-preview-data";

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredStudents = ADMIN_STUDENTS_PREVIEW.filter(
    (std) =>
      std.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Cadet Directory</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Student Management Roster</h1>
        <p className="mt-1 text-sm text-steel-300">
          View registered candidate profiles, exam progress, and enrollment states.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Registered Candidates ({filteredStudents.length})</CardTitle>
          <input
            type="text"
            placeholder="Search candidates by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-xs text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none sm:w-64"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-steel-700 bg-navy-950 font-mono text-steel-400 uppercase">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Candidate Name</th>
                  <th className="p-3">Target Exam</th>
                  <th className="p-3">Current Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-700/50">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-navy-800/40">
                    <td className="p-3 font-mono text-steel-400">{std.id}</td>
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