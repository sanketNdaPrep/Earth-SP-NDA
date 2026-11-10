import * as React from "react";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Icons are chosen by name so the data stays serialisable across server and client components. */
export type StatIconName =
  | "target"
  | "book"
  | "calculator"
  | "shield"
  | "plane"
  | "users"
  | "checkCircle"
  | "sigma"
  | "triangle"
  | "atom"
  | "flask"
  | "globe"
  | "landmark";

export interface StatTrend {
  direction: "up" | "down" | "flat";
  /** Human wording, for example "4 more than last week". */
  text: string;
}

export interface StatItem {
  id: string;
  title: string;
  value: string;
  description?: string;
  icon?: StatIconName;
  trend?: StatTrend;
}

export interface StatsGridProps {
  /** Required: this component never invents numbers. */
  stats: StatItem[];
  /** Accessible name for the group of figures. */
  label?: string;
  className?: string;
}

const TREND_STYLES = {
  up: { word: "Increase", className: "text-emerald-300", Icon: Icons.trendUp },
  down: { word: "Decrease", className: "text-danger-400", Icon: Icons.trendDown },
  flat: { word: "No change", className: "text-steel-300", Icon: null },
} as const;

/**
 * Row of key figures: stacked on phones, equal-width columns from sm up, for any
 * number of stats. Markup is a description list. Trend direction is conveyed by an
 * icon, colour and screen-reader text. Server component (no client JavaScript).
 */
export function StatsGrid({ stats, label, className }: StatsGridProps) {
  return (
    <dl
      aria-label={label}
      className={cn(
        "grid grid-cols-1 divide-y divide-steel-700 overflow-hidden rounded-panel border border-steel-700 bg-navy-900 shadow-panel",
        "sm:grid-flow-col sm:auto-cols-fr sm:divide-x sm:divide-y-0",
        className,
      )}
    >
      {stats.map((stat) => {
        const Icon = stat.icon ? Icons[stat.icon] : null;
        const trend = stat.trend ? TREND_STYLES[stat.trend.direction] : null;
        const TrendIcon = trend?.Icon ?? null;

        return (
          <div key={stat.id} className="relative flex flex-col gap-1 p-5 sm:p-6">
            {Icon ? <Icon aria-hidden="true" className="absolute top-5 right-5 size-8 text-steel-300 sm:top-6 sm:right-6" /> : null}

            <dt className="pr-12 font-mono text-xs font-semibold uppercase tracking-wider text-steel-300">{stat.title}</dt>
            <dd className="text-4xl font-semibold tracking-tight text-white tabular-nums">{stat.value}</dd>
            {stat.description ? <dd className="text-xs text-steel-300">{stat.description}</dd> : null}
            {stat.trend && trend ? (
              <dd className={cn("mt-1 flex items-center gap-1.5 text-xs font-medium", trend.className)}>
                {TrendIcon ? <TrendIcon className="size-4 shrink-0" /> : <span aria-hidden="true" className="h-0.5 w-3 shrink-0 bg-current" />}
                <span className="sr-only">{trend.word}: </span>
                {stat.trend.text}
              </dd>
            ) : null}
          </div>
        );
      })}
    </dl>
  );
}

export default StatsGrid;