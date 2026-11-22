"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { parseQuestionPdf } from "@/lib/pdf-questions";
import { questionPdfProblem, readPdfText } from "@/lib/pdf-text";
import { fromDraft, type BuilderQuestion } from "@/lib/test-questions";

export interface PdfReading {
  file: File;
  questions: BuilderQuestion[];
  warnings: string[];
}

/** Picks a question PDF and reads it in the browser. Nothing is saved here. */
export function PdfImport({ disabled, onRead }: { disabled?: boolean; onRead: (reading: PdfReading) => void }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const bad = questionPdfProblem(file);
    if (bad) {
      setError(bad);
      return;
    }
    setBusy(true);
    try {
      const { items } = await readPdfText(file);
      const result = parseQuestionPdf(items);
      if (result.questions.length === 0) {
        setError(result.warnings[0] ?? "No questions were found in this PDF. If it is a scan, type the questions or add them one by one.");
        return;
      }
      onRead({ file, questions: result.questions.map(fromDraft), warnings: result.warnings });
    } catch (e) {
      setError(e instanceof Error ? e.message : "This PDF could not be read.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-steel-300">
        Upload a PDF with the questions, options, answers and explanations. The site reads it, works out each question and its answer, and shows them below for you to check before saving. Students can later download this same PDF.
      </p>
      <input ref={inputRef} id="mt-pdf" type="file" accept="application/pdf,.pdf" className="sr-only" disabled={disabled || busy} onChange={(e) => void pick(e.target.files?.[0])} />
      <Button type="button" variant="outline" disabled={disabled || busy} loading={busy} onClick={() => inputRef.current?.click()}>
        <Icons.download className="size-4 rotate-180" />
        {busy ? "Reading the PDF..." : "Choose a question PDF"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs font-semibold text-danger-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
