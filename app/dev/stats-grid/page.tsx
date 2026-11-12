import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { StatsGrid, type StatItem } from "@/components/ui/stats-grid";

export const metadata = { title: "Stats grid (dev only)", robots: { index: false } };

/** Sample numbers for the preview only. */
const THREE: StatItem[] = [
  { id: "tests", title: "Tests attempted", value: "24", description: "Since you joined", icon: "target", trend: { direction: "up", text: "4 more than last week" } },
  { id: "questions", title: "Questions solved", value: "960", description: "Across all subjects", icon: "checkCircle", trend: { direction: "up", text: "120 this week (14%)" } },
  { id: "accuracy", title: "Average accuracy", value: "68%", description: "Last 10 attempts", icon: "calculator", trend: { direction: "down", text: "2 points (3%)" } },
];

const TWO: StatItem[] = THREE.slice(0, 2);

const FOUR: StatItem[] = [
  ...THREE,
  { id: "streak", title: "Study streak", value: "9 days", description: "Keep it going", icon: "book", trend: { direction: "flat", text: "Same as last week" } },
];

export default function StatsGridDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-12 sm:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">Stats grid</h1>
        <Badge variant="outline">Sample data</Badge>
      </div>
      <StatsGrid label="Cadet progress, three figures" stats={THREE} />
      <StatsGrid label="Two figures" stats={TWO} />
      <StatsGrid label="Four figures" stats={FOUR} />
    </main>
  );
}