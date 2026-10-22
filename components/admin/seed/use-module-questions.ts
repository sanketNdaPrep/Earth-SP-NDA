'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
    void refresh();
  }, [refresh]);

  return { items, state, refresh };
}