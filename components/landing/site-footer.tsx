import Link from "next/link";
import { Icons } from "@/components/ui/icons";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Portal",
    links: [
      { label: "Home", href: "/" },
      { label: "Study material", href: "/study-material" },
      { label: "Mock tests", href: "/quizzes" },
      { label: "Flashcards", href: "/flashcards" },
      { label: "Roadmap", href: "/#roadmap" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Exams",
    links: [
      { label: "NDA", href: "/exams/nda" },
      { label: "CDS", href: "/exams/cds" },
      { label: "AFCAT", href: "/exams/afcat" },
      { label: "Syllabus", href: "/exams/nda#syllabus" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "My dashboard", href: "/dashboard" },
      { label: "Profile", href: "/profile" },
    ],
  },
];

const linkClass =
  "text-sm text-steel-300 transition-colors hover:text-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

/** Footer for public pages: link columns, the disclaimer, and the quiet way into the Admin Suite. */
export function SiteFooter() {
  return (
    <footer className="border-t border-steel-700 bg-navy-950 py-12 text-xs text-steel-500">
      <div className="mx-auto max-w-6xl space-y-10 px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wider text-white">
              <Icons.logo className="size-6 text-gold-400" />
              EARTH SP NDA
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-steel-300">
              Free preparation portal for NDA, CDS and AFCAT aspirants: study material, flashcards and mock tests in one place.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="space-y-4">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gold-300">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="space-y-3 text-pretty border-t border-steel-700 pt-8 text-steel-300">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gold-300">Disclaimer and privacy</p>
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
            className="inline-flex items-center gap-2 rounded-full border border-gold-400/60 px-4 py-2 font-semibold text-gold-300 transition-colors hover:bg-gold-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
          >
            <Icons.key className="size-4" />
            Admin access
          </Link>
        </div>
      </div>
    </footer>
  );
}
