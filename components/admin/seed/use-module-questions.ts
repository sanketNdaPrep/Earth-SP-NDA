'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { logAdminAction } from '@/lib/adminLog';
import { supabase } from '@/lib/supabaseClient';
import type { LoadState, ModuleQuestion } from './types';

/**
 * Read-only list of the questions already stored in a module.
 * Used for duplicate detection and the "Module questions" tab.
 */
export function useModuleQuestions(quizId: string) {
  const [items, setItems] = useState<ModuleQuestion[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const latest = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++latest.current;
    if (!quizId) {
      setItems([]);
      setState('ready');
      return;
    }
    const { data, error } = await supabase
      .from('questions')
      .select('id, question_text, correct_option, position, explanation')
      .eq('quiz_id', quizId)
      .order('position', { ascending: true });

    // A newer request (another module was picked) has already taken over.
    if (request !== latest.current) return;
    if (error) {
      setState('error');
      return;
    }
    setItems((data ?? []) as ModuleQuestion[]);
    setState('ready');
  }, [quizId]);

  useEffect(() => {
  const timer = setTimeout(() => void refresh(), 0);
  return () => clearTimeout(timer);
}, [refresh]);

  /** Deletes one question, writes it to the audit log, then reloads the list. */
  const remove = useCallback(
    async (question: ModuleQuestion, moduleTitle: string): Promise<{ ok: true } | { ok: false; error: string }> => {
      const { data, error } = await supabase.from('questions').delete().eq('id', question.id).select('id');
      if (error || !data?.length) {
        return { ok: false, error: error?.message ?? 'The question was not deleted. You may not have permission.' };
      }
      await logAdminAction({
        action: 'deleted',
        entityType: 'question',
        label: `Question #${question.position ?? '?'} in ${moduleTitle}`,
        details: { quiz_id: quizId, question_id: question.id, text: question.question_text.slice(0, 120) },
      });
      await refresh();
      return { ok: true };
    },
    [quizId, refresh],
  );

  return { items, state, refresh, remove };
}