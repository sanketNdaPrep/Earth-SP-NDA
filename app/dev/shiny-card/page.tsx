import { notFound } from "next/navigation";
import { ShinyChecklistCard } from "@/components/ui/shiny-checklist-card";

export const metadata = { title: "Shiny checklist card (dev only)", robots: { index: false } };

export default function ShinyCardDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-navy-950 text-steel-100 flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <ShinyChecklistCard />
      <ShinyChecklistCard
        title="Weekly goals"
        subtitle="All complete"
        steps={[
          { title: "Five maths mocks", time: "5h" },
          { title: "Two GAT mocks", time: "3h" },
        ]}
      />
    </main>
  );
}
