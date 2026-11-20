'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  ready: boolean;
  saving: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

export function FormActions({
  ready,
  saving,
  onReset,
  onSubmit,
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-2 border-t border-steel-700/50">
      <Button type="button" variant="secondary" size="sm" onClick={onReset}>
        Clear / Reset Form
      </Button>

      <Button type="button" onClick={onSubmit} disabled={!ready} loading={saving}>
        {saving ? 'Publishing to Supabase...' : (
          <>
            <span>🚀</span> Publish Question
          </>
        )}
      </Button>
    </div>
  );
}