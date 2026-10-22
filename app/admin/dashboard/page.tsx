import React from 'react';
import { AdminDashboard } from '@/components/admin/dashboard/dashboard';

export const metadata = {
  title: 'Admin Command Center | EARTH SP NDA',
  description: 'Central management dashboard for EARTH SP NDA portal.',
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}