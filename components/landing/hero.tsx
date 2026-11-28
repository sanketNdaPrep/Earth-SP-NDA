import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { HERO_CONTENT } from "@/lib/landing-content";

// Plain facts about the portal. No user counts or accuracy figures: those are only shown once they are real.
const BRIEF: { icon: keyof typeof Icons; title: string; value: string; text: string }[] = [
  { icon: "shield", title: "Entry schemes", value: "3", text: "NDA, CDS and AFCAT" },
  { icon: "checkCircle", title: "Cost to start", value: "Free", text: "Practice, study material and tracking" },
  { icon: "target", title: "Answer review", value: "After every test", text: "Marks, explanations and weak topics" },
];

const ENTRIES = [
  { letter: "N", name: "NDA", full: "National Defence Academy", href: "/exams/nda" },
  { letter: "C", name: "CDS", full: "Combined Defence Services", href: "/exams/cds" },
  { letter: "A", name: "AFCAT", full: "Air Force Common Admission Test", href: "/exams/afcat" },
];

const pill = "w-full rounded-full";

/** Home hero: pill, headline, three equal buttons, the Platform Brief box, and the N, C, A entry circles on a grid. */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
      <div aria-hidden="true" className="graticule pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-400/60 bg-gold-400/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-gold-300">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-400" />
            {HERO_CONTENT.badgeText}
          </p>

          <h1 className="text-balance font-display text-5xl font-bold uppercase leading-none tracking-tight text-white sm:text-6xl md:text-7xl">
            {HERO_CONTENT.title}
          </h1>

          <p className="max-w-xl text-pretty text-base leading-relaxed text-steel-300 sm:text-lg">{HERO_CONTENT.subtitle}</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <Button asChild variant="action" size="lg" className={pill}>
              <Link href="/register">
                Start Free Practice
                <Icons.arrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className={pill}>
              <Link href="#roadmap">Exam Roadmap</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className={pill}>
              <Link href="/study-material">Free Study Material</Link>
            </Button>
          </div>
        </div>

        <aside aria-label="Platform brief" className="brackets rounded-panel border border-steel-700 bg-navy-900/80 p-6 shadow-panel backdrop-blur-sm">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gold-300">Platform brief</p>
          <dl className="mt-5 divide-y divide-steel-700">
            {BRIEF.map((b) => {
              const Icon = Icons[b.icon];
              return (
                <div key={b.title} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-tile bg-gold-400/15 text-gold-300">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="font-mono text-xs font-semibold uppercase tracking-widest text-steel-500">{b.title}</dt>
                    <dd className="font-display text-2xl font-bold uppercase tracking-tight text-white">{b.value}</dd>
                    <dd className="text-sm text-steel-300">{b.text}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </aside>
      </div>

      <nav aria-label="Entry schemes" className="relative z-10 mx-auto mt-16 max-w-3xl">
        <ul className="grid grid-cols-3 gap-4">
          {ENTRIES.map((e) => (
            <li key={e.letter}>
              <Link href={e.href} className="group flex flex-col items-center gap-3 text-center focus-visible:outline-none">
                <span className="flex size-20 items-center justify-center rounded-full border-2 border-gold-400/70 bg-navy-900 font-display text-3xl font-bold text-gold-300 shadow-panel transition-colors group-hover:bg-gold-400 group-hover:text-navy-950 group-focus-visible:ring-2 group-focus-visible:ring-gold-300 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-navy-950 sm:size-24 sm:text-4xl">
                  {e.letter}
                </span>
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-white">{e.name}</span>
                <span className="hidden text-xs text-steel-500 sm:block">{e.full}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
