'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { parseAttempt, parseQuiz } from './analytics';
import type { AttemptRow, DashboardState, QuizSummary } from './types';

/**
 * Loads the signed-in cadet, their attempts and the module list. The attempt query is the one
 * the previous dashboard used, including its fallback to a plain select when the join fails.
 */
export function useDashboardData(): { state: DashboardState; retry: () => void } {
  const router = useRouter();
  const [state, setState] = useState<DashboardState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<DashboardState | null> {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        router.push('/login');
        return null;
      }

      const joined = await supabase
        .from('user_quiz_attempts')
        .select(
          `
          id,
          quiz_id,
          score,
          total_questions,
          attempted_at,
          quizzes (
            title,
            category
          )
        `,
        )
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false });

      let rows: unknown[] | null = joined.error ? null : (joined.data as unknown[] | null);
      if (rows === null) {
        const plain = await supabase
          .from('user_quiz_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('attempted_at', { ascending: false });
        if (plain.error) return { status: 'error', message: plain.error.message };
        rows = (plain.data as unknown[] | null) ?? [];
      }

      const quizResult = await supabase.from('quizzes').select('id, title, category, time_limit_mins');
      const quizzes: QuizSummary[] = quizResult.error
        ? []
        : ((quizResult.data as unknown[] | null) ?? [])
            .map(parseQuiz)
            .filter((quiz): quiz is QuizSummary => quiz !== null && quiz.id !== '');

      // When the join failed, attach titles from the module list so subjects can still be worked out.
      const byId = new Map(quizzes.map((quiz) => [quiz.id, quiz]));
      const attempts = rows
        .map(parseAttempt)
        .filter((item): item is AttemptRow => item !== null)
        .map((item) => (item.quiz ? item : { ...item, quiz: byId.get(item.quiz_id) ?? null }));

      return {
        status: 'ready',
        profile: {
          id: user.id,
          email: user.email ?? '',
          fullName: String(user.user_metadata?.full_name || 'Cadet'),
          targetExam: String(user.user_metadata?.target_exam || 'CDS'),
        },
        attempts,
        quizzes,
        quizzesFailed: Boolean(quizResult.error),
      };
    }

    load().then(
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
  }, [router, attempt]);

  return {
    state,
    retry: () => {
      setState({ status: 'loading' });
      setAttempt((count) => count + 1);
    },
  };
}