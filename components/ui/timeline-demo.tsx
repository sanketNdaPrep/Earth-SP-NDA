import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";

/* Placeholder roadmap content for the preview. Replace with real wording. */

function Summary({ children }: { children: React.ReactNode }) {
  return <p className="mb-6 max-w-prose text-sm text-steel-300 md:text-base">{children}</p>;
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mb-8 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-steel-100 md:text-base">
          <Icons.checkCircle className="mt-0.5 size-4 shrink-0 text-emerald-400" />
          {item}
        </li>
      ))}
    </ul>
  );
}

interface Tile {
  label: string;
  value: string;
  note: string;
  tone?: BadgeVariant;
}

function StatTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col gap-2 rounded-panel border border-steel-700 bg-navy-900 p-4 shadow-panel">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-steel-300">{tile.label}</p>
          <p className="text-3xl font-semibold text-white tabular-nums">{tile.value}</p>
          <Badge variant={tile.tone ?? "gold"} className="w-fit">
            {tile.note}
          </Badge>
        </div>
      ))}
    </div>
  );
}

const ENTRIES: TimelineEntry[] = [
  {
    title: "Foundation",
    content: (
      <div>
        <Summary>Months 1 to 3. Build the basics in maths and general ability before you start timing yourself.</Summary>
        <Checklist items={["Finish the NDA maths syllabus once", "Read the GAT syllabus and mark weak topics", "Learn the marking scheme for each exam"]} />
        <StatTiles
          tiles={[
            { label: "Maths topics", value: "4", note: "Algebra to Vectors" },
            { label: "Daily study", value: "30 min", note: "Untimed", tone: "emerald" },
          ]}
        />
      </div>
    ),
  },
  {
    title: "Practice",
    content: (
      <div>
        <Summary>Months 4 to 6. Drill one topic at a time and learn from every wrong answer.</Summary>
        <Checklist items={["Solve a topic drill every day", "Review every wrong answer the same day", "Keep an error log of repeated mistakes"]} />
        <StatTiles
          tiles={[
            { label: "Questions a day", value: "40", note: "Target" },
            { label: "Accuracy goal", value: "75%", note: "By month 6", tone: "emerald" },
          ]}
        />
      </div>
    ),
  },
  {
    title: "Mock tests",
    content: (
      <div>
        <Summary>Months 7 to 9. Sit full, timed papers and practise under the real marking scheme.</Summary>
        <Checklist items={["Take two full mocks every week", "Analyse each mock before starting the next", "Track your score trend and weakest section"]} />
        <StatTiles
          tiles={[
            { label: "Mocks a week", value: "2", note: "Full length" },
            { label: "NDA Maths marking", value: "+2.5 / -0.83", note: "Per question", tone: "outline" },
          ]}
        />
      </div>
    ),
  },
  {
    title: "Final revision",
    content: (
      <div>
        <Summary>The last 30 days. Revise, stay sharp and rest well before the exam.</Summary>
        <Checklist items={["Revise your error log twice", "Take short mocks to stay in rhythm", "Plan sleep and exam-day logistics"]} />
        <StatTiles
          tiles={[
            { label: "Revision days", value: "30", note: "Before the exam" },
            { label: "Short mocks", value: "10", note: "Keep the rhythm", tone: "emerald" },
          ]}
        />
      </div>
    ),
  },
];

/** Showcase: a preparation roadmap on the Timeline. */
export function TimelineDemo() {
  return (
    <Timeline
      data={ENTRIES}
      heading="Preparation roadmap"
      description="Four stages from your first syllabus read to exam week."
    />
  );
}