import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/dashboard/dashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | EARTH SP NDA',
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}