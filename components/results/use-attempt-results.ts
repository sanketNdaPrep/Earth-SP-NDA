'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { loadAttemptDetails, pairAttemptDetail } from '@/components/quiz/attempt-detail';
import { sortByPosition, toQuestion } from '@/components/quiz/question-loader';
import type { QuizRecord } from '@/components/quiz/types';
import type { AttemptRecord, ResultsState } from './types';

const num = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Loads one attempt, its module and questions, and pairs it with the answers saved in this browser.
 * Only the signed-in cadet's own attempt can be opened.
 */
export function useAttemptResults(attemptId: string | undefined): { state: ResultsState; retry: () => void } {
  const router = useRouter();
  const [state, setState] = useState<ResultsState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!attemptId) return;
    let cancelled = false;

    async function load(id: string): Promise<ResultsState | null> {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        router.push('/login');
        return null;
      }

      const attemptResult = await supabase
        .from('user_quiz_attempts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (attemptResult.error || !attemptResult.data) {
        // PGRST116: no row matched. 22P02: the id is not a valid uuid.
        const code = attemptResult.error?.code;
        if (!attemptResult.error || code === 'PGRST116' || code === '22P02') return { status: 'missing' };
        return { status: 'error', message: attemptResult.error.message };
      }

      const row = attemptResult.data as Record<string, unknown>;
      const record: AttemptRecord = {
        id: String(row.id),
        quiz_id: String(row.quiz_id),
        score: num(row.score),
        total_questions: num(row.total_questions),
        attempted_at: typeof row.attempted_at === 'string' ? row.attempted_at : null,
      };

      const [quizResult, questionResult, cohortResult] = await Promise.all([
        supabase.from('quizzes').select('*').eq('id', record.quiz_id).single(),
        supabase.from('questions').select('*').eq('quiz_id', record.quiz_id),
        // Depends on the table's read policy: usually only this cadet's own rows come back.
        supabase.from('user_quiz_attempts').select('score, total_questions').eq('quiz_id', record.quiz_id),
      ]);

      if (quizResult.error || !quizResult.data) {
        return quizResult.error && quizResult.error.code !== 'PGRST116'
          ? { status: 'error', message: quizResult.error.message }
          : { status: 'missing' };
      }
      if (questionResult.error) return { status: 'error', message: questionResult.error.message };

      const quizRow = quizResult.data as Record<string, unknown>;
      const quiz: QuizRecord = {
        id: String(quizRow.id),
        title: String(quizRow.title ?? 'Practice test'),
        category: String(quizRow.category ?? 'General'),
        description: typeof quizRow.description === 'string' ? quizRow.description : null,
        time_limit_mins: typeof quizRow.time_limit_mins === 'number' ? quizRow.time_limit_mins : null,
      };

      const cohort = cohortResult.error
        ? []
        : ((cohortResult.data as Record<string, unknown>[] | null) ?? [])
            .map((item) => {
              const total = num(item.total_questions);
              return total > 0 ? num(item.score) / total : null;
            })
            .filter((value): value is number => value !== null);

      const attemptedAt = record.attempted_at ? Date.parse(record.attempted_at) : Number.NaN;
      const detail = pairAttemptDetail(loadAttemptDetails(user.id, record.quiz_id), {
        score: record.score,
        total_questions: record.total_questions,
        attemptedAt: Number.isNaN(attemptedAt) ? null : attemptedAt,
      });

      return {
        status: 'ready',
        attempt: record,
        quiz,
        questions: sortByPosition((questionResult.data ?? []).map((item) => toQuestion(item))),
        detail,
        cohort,
      };
    }

    load(attemptId).then(
      (next) => {
        if (!cancelled && next) setState(next);
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: error instanceof Error ? error.message : 'Network error.' });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [attemptId, router, attempt]);

  return {
    state,
    retry: () => {
      setState({ status: 'loading' });
      setAttempt((count) => count + 1);
    },
  };
}