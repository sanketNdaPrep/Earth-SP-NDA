import { CardSpread } from "@/components/ui/card-spread";
import type { Feature } from "@/components/ui/feature-card-face";

const TRACKS: Feature[] = [
  { category: "Mathematics", title: "NDA Maths Paper", badges: ["+2.5 / -0.83"], icon: "calculator", tone: "gold" },
  { category: "General Ability", title: "GAT Practice", badges: ["+4 / -1.33"], icon: "book", tone: "emerald" },
  { category: "Officer Entry", title: "CDS Mocks", badges: ["+1 / -0.33"], icon: "shield", tone: "steel" },
  { category: "Air Force", title: "AFCAT Mocks", badges: ["+3 / -1"], icon: "plane", tone: "gold" },
];

/** Showcase section: four exam tracks as a deck that spreads on demand. */
export function CardSpreadDemo() {
  return (
    <section className="flex w-full flex-col items-center gap-6 py-12">
      <header className="flex max-w-md flex-col items-center gap-2 px-4 text-center">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Four papers, one deck</h2>
        <p className="text-balance text-base text-steel-300 sm:text-lg">
          Spread the cards to see every exam track and the marking scheme it uses.
        </p>
      </header>
      <CardSpread features={TRACKS} className="w-full" />
    </section>
  );
}