import Link from 'next/link';
import { DISCLAIMER } from '@/lib/landing-content';
import { ShieldMark } from './icons';

const linkClass = 'text-steel-300 transition-colors hover:text-white';

const COPYRIGHT_YEAR = 2026;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-steel-700/60 bg-navy-950">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="EARTH SP NDA home">
              <ShieldMark className="size-8 text-emerald-400" />
              <span translate="no" className="text-base font-semibold tracking-tight text-white">
                EARTH SP NDA
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-steel-300">
              Practice tests, free notes and study plans for NDA, CDS and AFCAT aspirants who study
              on their own.
            </p>
          </div>

          <nav aria-label="Explore">
            <p className="text-sm font-semibold text-white">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/quizzes" className={linkClass}>Practice tests</Link></li>
              <li><a href="#vault" className={linkClass}>Notes vault</a></li>
              <li><a href="#journey" className={linkClass}>My journey</a></li>
              <li><a href="#faq" className={linkClass}>FAQ</a></li>
            </ul>
          </nav>

          <nav aria-label="Account">
            <p className="text-sm font-semibold text-white">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/login" className={linkClass}>Sign in</Link></li>
              <li><Link href="/signup" className={linkClass}>Create account</Link></li>
              <li><Link href="/admin/login" className={linkClass}>Admin portal</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-steel-700/60 pt-6">
          <p className="max-w-3xl text-sm leading-relaxed text-steel-300">
            <strong className="font-semibold text-steel-100">Disclaimer.</strong> {DISCLAIMER}
          </p>
          <p className="mt-4 text-xs text-steel-300">
            © {COPYRIGHT_YEAR} <span translate="no">EARTH SP NDA</span>. Made by Sanket.
          </p>
        </div>
      </div>
    </footer>
  );
}