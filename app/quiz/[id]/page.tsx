import type { Metadata } from 'next';
import { Suspense } from 'react';
import { QuizPlayer, QuizPlayerFallback } from '@/components/quiz/quiz-player';

// Quiz-taking pages stay out of search results.
export const metadata: Metadata = {
  title: 'Live test | EARTH SP NDA',
  robots: { index: false, follow: false },
};

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizPlayerFallback />}>
      <QuizPlayer />
    </Suspense>
  );
}