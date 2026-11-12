import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AccordionList, type AccordionListItem } from "@/components/ui/accordion-demo";

export const metadata = { title: "Accordion (dev only)", robots: { index: false } };

/** Sample copy for the preview only. */
const ITEMS: AccordionListItem[] = [
  {
    value: "scoring",
    title: "How are mock tests scored?",
    content: "Each correct answer earns marks and each wrong answer loses a fraction, matching the real paper for that track.",
  },
  {
    value: "papers",
    title: "Previous year papers",
    disabled: true,
    disabledNote: "Coming soon",
    content: "Solved papers from earlier years will appear here once they are ready.",
  },
  {
    value: "retake",
    title: "Can I retake a test?",
    content: "Yes. Every attempt is saved separately, so you can compare your scores over time.",
  },
];

export default function AccordionDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 bg-navy-950 px-4 py-12 text-steel-100 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Accordion</h1>
        <Badge variant="outline">Sample copy</Badge>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Single open, one item disabled</h2>
        <AccordionList items={ITEMS} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Multiple open</h2>
        <AccordionList type="multiple" items={ITEMS.filter((i) => !i.disabled)} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">First item open by default</h2>
        <AccordionList items={ITEMS} defaultOpen={["scoring"]} />
      </section>
    </main>
  );
}