'use client';

import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BULK_CHUNK, BULK_MAX_FILE_BYTES } from './data';
import { parseBulk, type ParsedRow } from './bulk-parser';
import { normalize } from './validators';
import type { SeedForm } from './use-seed-form';

type Shared = Pick<SeedForm, 'quizId' | 'selectedQuiz' | 'setBanner' | 'afterImport' | 'moduleQuestions'>;

/**
 * Bulk import state. Rows are inserted into `questions` with the same
 * columns the single-question form uses, positioned after the existing ones.
 */
export function useBulkImport(shared: Shared) {
  const { quizId, selectedQuiz, setBanner, afterImport, moduleQuestions } = shared;

  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);

  const parsed = useMemo(() => parseBulk(text), [text]);

  const existingKeys = useMemo(
    () => new Set(moduleQuestions.items.map((q) => normalize(q.question_text))),
    [moduleQuestions.items],
  );

  const duplicates = useMemo(
    () => parsed.rows.filter((row) => existingKeys.has(normalize(row.question))),
    [parsed.rows, existingKeys],
  );

  const toImport: ParsedRow[] = useMemo(
    () => (skipDuplicates ? parsed.rows.filter((row) => !existingKeys.has(normalize(row.question))) : parsed.rows),
    [parsed.rows, skipDuplicates, existingKeys],
  );

  const clear = () => {
    setText('');
    setFileName(null);
  };

  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > BULK_MAX_FILE_BYTES) {
      setBanner({ type: 'error', text: 'That file is over 1 MB. Split it into smaller files.' });
      return;
    }
    try {
      setText(await file.text());
      setFileName(file.name);
      setBanner(null);
    } catch {
      setBanner({ type: 'error', text: 'Could not read that file. Try a .txt or .json file.' });
    }
  };

  const runImport = async () => {
    if (importing) return;
    if (!quizId) {
      setBanner({ type: 'error', text: 'Select or create a module first.' });
      return;
    }
    if (toImport.length === 0) {
      setBanner({ type: 'error', text: 'There are no valid questions to import.' });
      return;
    }

    setImporting(true);
    setBanner(null);

    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);
    const base = count || 0;

    const payload = toImport.map((row, i) => ({
      quiz_id: quizId,
      question_text: row.question,
      option_a: row.options.A,
      option_b: row.options.B,
      option_c: row.options.C,
      option_d: row.options.D,
      correct_option: row.correct,
      explanation: row.explanation || null,
      position: base + i + 1,
    }));

    let saved = 0;
    for (let start = 0; start < payload.length; start += BULK_CHUNK) {
      const chunk = payload.slice(start, start + BULK_CHUNK);
      const { error } = await supabase.from('questions').insert(chunk);
      if (error) {
        setImporting(false);
        setBanner({
          type: 'error',
          text: `Import stopped after ${saved} of ${payload.length} questions: ${error.message}`,
        });
        await afterImport();
        return;
      }
      saved += chunk.length;
    }

    setImporting(false);
    setBanner({
      type: 'success',
      text: `${saved} ${saved === 1 ? 'question' : 'questions'} added to "${selectedQuiz?.title ?? 'module'}".`,
    });
    clear();
    await afterImport();
  };

  return {
    text, setText, fileName, loadFile, clear,
    parsed, duplicates, toImport,
    skipDuplicates, setSkipDuplicates,
    importing, runImport,
  };
}

export type BulkImport = ReturnType<typeof useBulkImport>;