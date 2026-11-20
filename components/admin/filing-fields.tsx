"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NEW_SUBJECT, type FilingInput } from "@/lib/filing";
import { sortChapters, type Chapter, type TaxSubject } from "@/lib/taxonomy";

const labelClass = "block text-xs font-semibold uppercase tracking-wider text-steel-300";

export function emptyFiling(): FilingInput {
  return { subjectChoice: "", newSubjectName: "", chapterName: "" };
}

interface FilingFieldsProps {
  idPrefix: string;
  subjects: readonly TaxSubject[];
  chapters: readonly Chapter[];
  value: FilingInput;
  onChange: (next: FilingInput) => void;
  /** Called when a different existing subject is picked, so a form can start its exam tick-boxes from the subject's own. */
  onSubjectPicked?: (subject: TaxSubject | null) => void;
  disabled?: boolean;
}

/**
 * Subject and chapter for an upload or a move. The subject is picked from the list, or typed with "Other".
 * The chapter is always typed: names of the subject's existing chapters are offered as suggestions so nothing is duplicated.
 */
export function FilingFields({ idPrefix, subjects, chapters, value, onChange, onSubjectPicked, disabled }: FilingFieldsProps) {
  const typing = value.subjectChoice === NEW_SUBJECT;
  const picked = subjects.find((s) => s.id === value.subjectChoice);
  const suggestions = picked ? sortChapters(chapters.filter((c) => c.subject_id === picked.id)) : [];
  const hasSubject = Boolean(value.subjectChoice);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}-subject`} className={labelClass}>Subject</label>
          <Select
            id={`${idPrefix}-subject`}
            value={value.subjectChoice}
            disabled={disabled}
            onChange={(e) => {
              const choice = e.target.value;
              onChange({ subjectChoice: choice, newSubjectName: choice === NEW_SUBJECT ? value.newSubjectName : "", chapterName: "" });
              onSubjectPicked?.(subjects.find((s) => s.id === choice) ?? null);
            }}
          >
            <option value="">Pick a subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
            <option value={NEW_SUBJECT}>Other (type a new one)</option>
          </Select>
        </div>
        {typing ? (
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}-new-subject`} className={labelClass}>New subject name</label>
            <Input
              id={`${idPrefix}-new-subject`}
              value={value.newSubjectName}
              disabled={disabled}
              maxLength={60}
              autoComplete="off"
              placeholder="For example Geology"
              onChange={(e) => onChange({ ...value, newSubjectName: e.target.value })}
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor={`${idPrefix}-chapter`} className={labelClass}>Chapter</label>
        <Input
          id={`${idPrefix}-chapter`}
          value={value.chapterName}
          disabled={disabled || !hasSubject}
          maxLength={60}
          autoComplete="off"
          list={`${idPrefix}-chapter-list`}
          placeholder={hasSubject ? "Type the chapter name, or leave empty" : "Pick a subject first"}
          onChange={(e) => onChange({ ...value, chapterName: e.target.value })}
        />
        <datalist id={`${idPrefix}-chapter-list`}>
          {suggestions.map((c) => (
            <option key={c.id} value={c.name} />
          ))}
        </datalist>
        <p className="text-xs text-steel-500">A new subject or chapter is created for you when you save.</p>
      </div>
    </div>
  );
}
