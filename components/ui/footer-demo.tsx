import Link from "next/link";
import { Footer, type FooterColumnData } from "@/components/ui/footer";

const EXPLORE: FooterColumnData = {
  title: "Explore",
  highlight: { title: "Start a practice test", href: "/quizzes" },
  links: [
    { title: "Practice tests", href: "/quizzes" },
    { title: "Notes vault", href: "/#vault" },
    { title: "My journey", href: "/#journey" },
    { title: "FAQ", href: "/#faq" },
  ],
};

const ACCOUNT: FooterColumnData = {
  title: "Account",
  highlight: { title: "Open your dashboard", href: "/dashboard" },
  links: [
    { title: "Sign in", href: "/login" },
    { title: "Create account", href: "/signup" },
  ],
};

function Brand() {
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Link href="/" className="w-fit rounded-control text-base font-semibold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
        translate="no">
        EARTH SP NDA
      </Link>
      <p className="text-sm leading-relaxed text-steel-300">
        Practice tests, free notes and study plans for NDA, CDS and AFCAT aspirants who study on their own.
      </p>
    </div>
  );
}

/** Full footer: brand, two columns with highlight rows, legal line and copyright. */
export function FooterDemo() {
  return (
    <Footer
      year={2026}
      owner="EARTH SP NDA"
      credit="Made by Sanket."
      brand={<Brand />}
      columns={[EXPLORE, ACCOUNT]}
      legal={
        <p>
          <strong className="font-semibold text-steel-100">Disclaimer.</strong> This is an independent study
          resource and is not affiliated with any government body or exam authority.
        </p>
      }
    />
  );
}

/** Minimal footer: one column, no brand, no highlight, no legal line. */
export function FooterMinimalDemo() {
  return (
    <Footer
      year={2026}
      owner="EARTH SP NDA"
      columns={[{ title: "Explore", links: EXPLORE.links }]}
    />
  );
}

/** Four columns, to check the widest layout. */
export function FooterFourColumnDemo() {
  return (
    <Footer
      year={2026}
      owner="EARTH SP NDA"
      columns={[
        { title: "Practise", links: [{ title: "Practice tests", href: "/quizzes" }] },
        {
          title: "Study",
          links: [
            { title: "Notes vault", href: "/#vault" },
            { title: "My journey", href: "/#journey" },
          ],
        },
        { title: "Account", links: ACCOUNT.links },
        { title: "Help", links: [{ title: "FAQ", href: "/#faq" }] },
      ]}
    />
  );
}