import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/dashboard-view';

// Signed-in pages stay out of search results.
export const metadata: Metadata = {
  title: 'Cadet dashboard | EARTH SP NDA',
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardView />;
}