import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderCard } from "@/components/ui/folder-card";
import { Icons } from "@/components/ui/icons";
import { SectionHeader } from "@/components/ui/section-header";
import { SUPPORT_CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with your EARTH SP NDA account, tests or study material.",
};

const HELP = [
  { title: "Account and sign-in", text: "Cannot log in or did not get the email? Use the reset link on the log in page first.", href: "/login", meta: "Log in" },
  { title: "Tests and results", text: "Open Mock tests to take a test. Your marks and explanations are in your dashboard.", href: "/quizzes", meta: "Mock tests" },
  { title: "Study material", text: "Notes, PDFs and syllabus files are in Study material, sorted by exam and subject.", href: "/study-material", meta: "Study material" },
];

export default function SupportPage() {
  const hasContact = SUPPORT_CONTACT.value.trim().length > 0;
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-14 md:px-8">
      <SectionHeader as="h1" label="Support" title="How can we help?" description="Most questions are answered below. If yours is not, write to us and say which exam, page and device you were using." />

      <div className="grid gap-4 md:grid-cols-3">
        {HELP.map((h, i) => (
          <FolderCard key={h.title} title={h.title} description={h.text} meta={h.meta} actionLabel="Open" tone={i === 1 ? "tint" : "plain"} href={h.href} />
        ))}
      </div>

      <section aria-labelledby="contact" className="rounded-card border border-steel-700 bg-navy-900 p-6 shadow-panel md:p-8">
        <h2 id="contact" className="font-display text-2xl font-bold tracking-tight text-white">Contact us</h2>
        {hasContact ? (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <p className="text-steel-300">
              {SUPPORT_CONTACT.label}: <span className="select-all font-semibold text-white">{SUPPORT_CONTACT.value}</span>
            </p>
            {SUPPORT_CONTACT.href ? (
              <Button asChild variant="action">
                <a href={SUPPORT_CONTACT.href}>
                  Write to us <Icons.arrowUpRight className="size-4" />
                </a>
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-steel-300">Contact details are coming soon. Until then, please use the pages above.</p>
        )}
        <p className="mt-6 text-sm text-steel-500">
          This is an independent preparation portal. Read the <Link href="/#features" className="text-gold-300 underline underline-offset-4">features</Link> to see what is included.
        </p>
      </section>
    </main>
  );
}
