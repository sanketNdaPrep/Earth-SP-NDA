"use client";

import * as React from "react";
import { cleanExams, EXAMS, type ExamId } from "@/lib/subjects";

interface ExamPickerProps {
  legend?: string;
  value: ExamId[];
  onChange: (next: ExamId[]) => void;
  hint?: string;
}

/** Tick-boxes for the exams a subject, picture or file is tied to. Leaving all unticked is fine. */
export function ExamPicker({ legend = "Exams (optional)", value, onChange, hint }: ExamPickerProps) {
  const toggle = (id: ExamId) => onChange(value.includes(id) ? value.filter((x) => x !== id) : cleanExams([...value, id]));
  return (
    <fieldset className="space-y-2">
      <legend className="block text-xs font-semibold uppercase tracking-wider text-steel-300">{legend}</legend>
      <div className="flex flex-wrap gap-4">
        {EXAMS.map((exam) => (
          <label key={exam.id} className="flex items-center gap-2 text-sm text-steel-100">
            <input type="checkbox" checked={value.includes(exam.id)} onChange={() => toggle(exam.id)} className="size-4 accent-gold-400" />
            {exam.name}
          </label>
        ))}
      </div>
      {hint ? <p className="text-xs text-steel-500">{hint}</p> : null}
    </fieldset>
  );
}
