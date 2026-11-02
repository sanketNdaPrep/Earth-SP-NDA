import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResultsView } from '@/components/results/results-view';

// Personal results stay out of search results.
export const metadata: Metadata = {
  title: 'Attempt analysis | EARTH SP NDA',
  robots: { index: false, follow: false },
};

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsView />
    </Suspense>
  );
}