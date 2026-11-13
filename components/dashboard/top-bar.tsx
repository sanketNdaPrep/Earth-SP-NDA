'use client';

import Link from 'next/link';
import { useSignOut } from '@/hooks/use-sign-out';
import { ShieldMark } from '@/components/icons';
import { focusRing, ghostButton } from '@/components/quiz/styles';

const link = `inline-flex min-h-11 touch-manipulation items-center rounded-md px-3 text-sm font-medium text-steel-300 transition-colors hover:text-white ${focusRing}`;

/** Slim navigation bar for the signed-in pages. Sign out behaves as it did on the old dashboard. */
export function TopBar() {
  const signOut = useSignOut();

  return (
    <header className="border-b border-steel-700/60 bg-navy-950">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 lg:px-6">
        <Link href="/" className={`flex min-h-11 items-center gap-2.5 rounded-md ${focusRing}`}>
          <ShieldMark className="size-7 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide text-white">EARTH SP NDA</span>
        </Link>
        <nav aria-label="Account" className="flex flex-wrap items-center gap-1">
          <Link href="/quizzes" className={link}>
            Practice tests
          </Link>
          <Link href="/dashboard" className={link}>
            Dashboard
          </Link>
          <Link href="/profile" className={link}>
            Profile
          </Link>
          <button type="button" onClick={signOut} className={`${ghostButton} ml-1`}>
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}