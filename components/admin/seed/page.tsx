import React from 'react';
import { SeedPortal } from '@/components/admin/seed/seed-portal';

export const metadata = {
  title: 'Admin Question Seeding Portal | EARTH SP NDA',
  description: 'Tactical question seeding, module management, and bulk import suite.',
};

export default function AdminSeedPage() {
  return <SeedPortal />;
}