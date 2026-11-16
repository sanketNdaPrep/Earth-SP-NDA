import Link from "next/link";
import { Icons } from "@/components/ui/icons";

/** Footer for public pages: what we store, who we are not, and the quiet way into the Admin Suite. */
export function SiteFooter() {
  return (
    <footer className="border-t border-steel-700 bg-navy-950 py-10 text-xs text-steel-500">
      <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-8">
        <div className="space-y-3 text-pretty text-steel-300">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">Disclaimer and privacy</p>
          <p>
            When you create an account we store your name, email address, phone number, target exam, and your practice, test and study
            activity. We use it only to run your dashboard and to guide your preparation. Administrators of this portal can see your name,
            email, target exam and results. Your password is handled by our sign-in provider and is never visible to us.
          </p>
          <p>
            EARTH SP NDA is an independent preparation portal. It is not affiliated with UPSC, the Indian Armed Forces or any government
            body. Syllabus, dates and rules can change, so always confirm them in the official notification before you apply.
          </p>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-steel-700 pt-6 sm:flex-row sm:items-center">
          <p>EARTH SP NDA. Free preparation portal for NDA, CDS and AFCAT aspirants.</p>
          <Link
            href="/admin/login"
            aria-label="Administrator access"
            className="inline-flex items-center gap-2 rounded-control border border-steel-700 px-3 py-1.5 font-semibold text-steel-300 transition-colors hover:border-gold-400 hover:text-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
          >
            <Icons.key className="size-4" />
            Admin access
          </Link>
        </div>
      </div>
    </footer>
  );
}
