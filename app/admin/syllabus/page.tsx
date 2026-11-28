"use client";

import { SubjectSyllabusManager } from "@/components/admin/subject-syllabus-manager";
import { SyllabusManager } from "@/components/admin/syllabus-manager";

export default function AdminSyllabusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Syllabus</h1>
        <p className="mt-1 max-w-2xl text-sm text-steel-300">
          Upload, replace or remove syllabus PDFs. Entry-wise files show on the home page cards and each exam page. Subject-wise files show in the exam folders and under Syllabus and Core Topics.
        </p>
      </div>
      <SyllabusManager />
      <SubjectSyllabusManager />
    </div>
  );
}
