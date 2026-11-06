'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useLandingData } from './landing-data';
import { AccountAddIcon, CloseIcon, MenuIcon, ShieldMark } from './icons';

const NAV = [
  { href: '/quizzes', label: 'Practice tests' },
  { href: '#vault', label: 'Notes vault' },
  { href: '#journey', label: 'My journey' },
  { href: '#faq', label: 'FAQ' },
];

const ghostButton =
  'inline-flex min-h-10 touch-manipulation items-center justify-center rounded-lg border border-zinc-800 px-4 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800/60';
const solidButton =
  'inline-flex min-h-10 touch-manipulation items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-950/40 transition-colors hover:bg-emerald-400';

function AccountLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user, resourcesState } = useLandingData();

  if (resourcesState === 'loading') {
    return <span aria-hidden="true" className="block h-10 w-44 rounded-lg bg-zinc-900/80 animate-pulse" />;
  }

  if (user) {
    return (
      <>
        <Link href="/profile" className={ghostButton} onClick={onNavigate}>
          Profile
        </Link>
        <Link href="/dashboard" className={solidButton} onClick={onNavigate}>
          Dashboard
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className={ghostButton} onClick={onNavigate}>
        Sign in
      </Link>
      <Link href="/signup" className={`${solidButton} group gap-2`} onClick={onNavigate}>
        <AccountAddIcon className="size-4" />
        Create account
      </Link>
    </>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-950"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label="EARTH SP NDA home">
            <ShieldMark className="size-8 text-emerald-400" />
            <span translate="no" className="text-base font-semibold tracking-tight text-white">
              EARTH SP NDA
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 text-sm md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-zinc-400 transition-colors hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <AccountLinks />
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2 grid size-11 touch-manipulation place-items-center rounded-lg text-zinc-200 hover:bg-zinc-900 md:hidden"
          >
            {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={menuId}
              key="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="border-t border-zinc-800/80 bg-zinc-950 md:hidden"
            >
              <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col px-5 py-3">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-zinc-800/40 py-3.5 text-base text-zinc-200"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex gap-2 py-4">
                  <AccountLinks onNavigate={() => setOpen(false)} />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}