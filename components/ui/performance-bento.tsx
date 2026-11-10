"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GlowCard } from "@/components/ui/glow-card";
import { Icons } from "@/components/ui/icons";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Types (all data comes in through props; nothing is simulated here)
   ========================================================================== */

export type SubjectIcon = "sigma" | "triangle" | "calculator" | "target" | "atom" | "flask" | "landmark" | "globe" | "book";

/** `score` is a percentage from 0 to 100. */
export interface ScorePoint {
  label: string;
  score: number;
}
export interface SubjectStat {
  name: string;
  /** Accuracy percentage from 0 to 100. */
  accuracy: number;
}
export interface LogEntry {
  text: string;
  detail?: string;
}
export interface AccuracyRing {
  label: string;
  /** Percentage from 0 to 100. */
  value: number;
}
export interface DayCount {
  label: string;
  count: number;
}
export interface SubjectChip {
  id: string;
  name: string;
  description: string;
  icon: SubjectIcon;
  href?: string;
}

export interface PerformanceBentoProps {
  scores: ScorePoint[];
  subjectStats: SubjectStat[];
  log: LogEntry[];
  rings: AccuracyRing[];
  daily: DayCount[];
  subjects: SubjectChip[];
  eyebrow?: string;
  heading?: string;
  intro?: string;
  /** Shows a "Sample data" badge. Set it whenever the numbers are not the cadet's own. */
  sample?: boolean;
  className?: string;
}

/* ==========================================================================
   Helpers
   ========================================================================== */

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

function toSmoothPath(points: Array<{ x: number; y: number }>): string {
  return points.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const mid = (prev.x + p.x) / 2;
    return `${d} C ${mid} ${prev.y}, ${mid} ${p.y}, ${p.x} ${p.y}`;
  }, "");
}

/** Status is always shown as text as well as colour. */
function statusOf(accuracy: number) {
  if (accuracy >= 75) return { label: "Strong", dot: "bg-emerald-400", text: "text-emerald-300" };
  if (accuracy >= 50) return { label: "Steady", dot: "bg-gold-400", text: "text-gold-300" };
  return { label: "Weak", dot: "bg-danger-400", text: "text-danger-400" };
}

function CardTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-sm font-medium text-steel-300">{children}</h3>
      {right}
    </div>
  );
}

/* ==========================================================================
   Cards
   ========================================================================== */

function ScoreTrendCard({ scores, subjectStats }: { scores: ScorePoint[]; subjectStats: SubjectStat[] }) {
  const gradientId = React.useId();
  const [hover, setHover] = React.useState<number | null>(null);
  const [kbd, setKbd] = React.useState<number | null>(null);

  const last = scores.length - 1;
  const latest = scores[last]?.score ?? 0;
  const animatedLatest = useAnimatedNumber(latest, 500);
  const shown = clamp(hover ?? kbd ?? last, 0, Math.max(last, 0));
  const inspecting = hover !== null || kbd !== null;

  const className = "min-h-105 sm:col-span-2 lg:row-span-2";

  if (scores.length === 0) {
    return (
      <GlowCard accent="gold" className={className}>
        <CardTitle>Score trend</CardTitle>
        <p className="text-sm text-steel-300">No attempts yet. Take a mock test to see your trend.</p>
      </GlowCard>
    );
  }

  const average = Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);
  const best = Math.max(...scores.map((s) => s.score));
  const points = scores.map((s, i) => ({
    x: scores.length > 1 ? (i / last) * 100 : 50,
    y: 95 - (clamp(s.score, 0, 100) / 100) * 85,
  }));
  const line = toSmoothPath(points);
  const area = `${line} L 100 100 L 0 100 Z`;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    setHover(Math.round(ratio * last));
  };

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = shown;
    if (e.key === "ArrowLeft") next = Math.max(0, shown - 1);
    else if (e.key === "ArrowRight") next = Math.min(last, shown + 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = next;
    else return;
    e.preventDefault();
    setKbd(next);
  };

  return (
    <GlowCard accent="gold" className={className}>
      <CardTitle>Score trend</CardTitle>

      <div className="mb-3 flex flex-wrap items-end gap-x-5 gap-y-2">
        <div className="flex items-end gap-1.5">
          <span className="text-5xl font-semibold leading-none tracking-tight text-white tabular-nums">
            {Math.round(animatedLatest)}
          </span>
          <span className="mb-1 text-sm text-steel-300">%</span>
        </div>
        <div className="mb-1 flex gap-4 text-xs text-steel-300">
          <span>
            avg <b className="font-medium text-steel-100">{average}%</b>
          </span>
          <span>
            best <b className="font-medium text-steel-100">{best}%</b>
          </span>
        </div>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Inspect attempts. Use the left and right arrow keys."
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={shown}
        aria-valuetext={`${scores[shown].label}: ${scores[shown].score} percent`}
        className="relative min-h-32 flex-1 cursor-crosshair rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        onKeyDown={handleKey}
        onBlur={() => setKbd(null)}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--color-gold-400)", stopOpacity: 0.35 }} />
              <stop offset="100%" style={{ stopColor: "var(--color-gold-400)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} className="stroke-steel-700" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          ))}

          <path d={area} fill={`url(#${gradientId})`} />
          <path
            d={line}
            fill="none"
            className="stroke-gold-300"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--color-gold-400) 70%, transparent))" }}
          />

          {inspecting && (
            <line x1={points[shown].x} x2={points[shown].x} y1="0" y2="100" className="stroke-steel-500" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          )}
        </svg>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold-300 bg-gold-400 shadow-glow"
          style={{ left: `${points[shown].x}%`, top: `${points[shown].y}%` }}
        />

        {inspecting && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-control border border-steel-700 bg-navy-950/95 px-2.5 py-1.5 text-xs shadow-panel backdrop-blur-md"
            style={{ left: `clamp(48px, ${points[shown].x}%, calc(100% - 48px))`, top: `calc(${points[shown].y}% - 14px)` }}
          >
            <div className="text-steel-300">{scores[shown].label}</div>
            <div className="font-medium text-white">{scores[shown].score}%</div>
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>Score by attempt, as a percentage</caption>
        <thead>
          <tr>
            <th scope="col">Attempt</th>
            <th scope="col">Score percent</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s) => (
            <tr key={s.label}>
              <th scope="row">{s.label}</th>
              <td>{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 flex justify-between text-xs text-steel-300" aria-hidden="true">
        <span>{scores[0].label}</span>
        <span>{scores[last].label}</span>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
        {subjectStats.map((s) => {
          const status = statusOf(s.accuracy);
          return (
            <li key={s.name} className="flex items-center gap-3 rounded-control px-2 py-1.5 text-sm transition-colors duration-(--duration-base) hover:bg-navy-800">
              <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", status.dot)} />
              <span className="flex-1 text-steel-100">{s.name}</span>
              <span className={cn("text-xs tabular-nums", status.text)}>
                {status.label} {s.accuracy}%
              </span>
            </li>
          );
        })}
      </ul>
    </GlowCard>
  );
}

function MissionLogCard({ log }: { log: LogEntry[] }) {
  return (
    <GlowCard accent="steel" className="min-h-85 sm:col-span-2 lg:col-span-1 lg:row-span-2">
      <CardTitle>Mission log</CardTitle>
      <ul
        aria-label="Recent activity"
        tabIndex={0}
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto rounded-panel border border-steel-700 bg-navy-950/60 p-4 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
      >
        {log.map((entry, i) => (
          <li key={`${entry.text}-${i}`} className="bento-slide flex gap-2" style={{ "--delay": `${i * 70}ms` } as React.CSSProperties}>
            <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 bg-gold-400" />
            <span className="min-w-0 flex-1 text-steel-100">{entry.text}</span>
            {entry.detail ? <span className="shrink-0 font-mono text-steel-300">{entry.detail}</span> : null}
          </li>
        ))}
      </ul>
    </GlowCard>
  );
}

const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function AccuracyCard({ rings }: { rings: AccuracyRing[] }) {
  return (
    <GlowCard accent="emerald" className="min-h-50">
      <CardTitle>Section accuracy</CardTitle>
      <ul className="flex flex-1 items-center justify-between gap-1">
        {rings.map((ring) => (
          <li key={ring.label} className="bento-ring-group flex flex-col items-center gap-2">
            <div className="relative size-14">
              <svg viewBox="0 0 50 50" className="size-full -rotate-90" aria-hidden="true">
                <circle cx="25" cy="25" r={RING_RADIUS} fill="none" className="stroke-steel-700" strokeWidth="4" />
                <circle
                  cx="25"
                  cy="25"
                  r={RING_RADIUS}
                  fill="none"
                  className="bento-ring stroke-emerald-400"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={
                    {
                      "--circ": `${RING_CIRCUMFERENCE}`,
                      "--from": `${RING_CIRCUMFERENCE}`,
                      "--to": `${RING_CIRCUMFERENCE * (1 - clamp(ring.value, 0, 100) / 100)}`,
                    } as React.CSSProperties
                  }
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                <span className="sr-only">{ring.label} accuracy: </span>
                {ring.value}
                <span className="sr-only"> percent</span>
              </span>
            </div>
            <span aria-hidden="true" className="text-xs text-steel-300">
              {ring.label}
            </span>
          </li>
        ))}
      </ul>
    </GlowCard>
  );
}

function DailyCard({ daily }: { daily: DayCount[] }) {
  const latest = daily[daily.length - 1]?.count ?? 0;
  const animated = useAnimatedNumber(latest, 600);
  const max = Math.max(1, ...daily.map((d) => d.count));

  return (
    <GlowCard accent="gold" className="min-h-50">
      <CardTitle>Questions per day</CardTitle>
      <div className="text-4xl font-semibold leading-none tracking-tight text-white tabular-nums">{Math.round(animated).toLocaleString("en-US")}</div>
      <p className="sr-only">
        Questions per day over the last {daily.length} days, oldest first: {daily.map((d) => `${d.label} ${d.count}`).join(", ")}.
      </p>
      <div className="mt-auto flex h-14 items-end gap-1" aria-hidden="true">
        {daily.map((d, i) => (
          <span
            key={d.label}
            className={cn("flex-1 rounded-control", i === daily.length - 1 ? "bg-gold-300 shadow-glow" : "bg-gold-400/30")}
            style={{ height: `${Math.max((d.count / max) * 100, 8)}%` }}
          />
        ))}
      </div>
    </GlowCard>
  );
}

function SubjectsCard({ subjects }: { subjects: SubjectChip[] }) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const active = subjects.find((s) => s.id === activeId);

  const chip =
    "flex w-full flex-col items-center gap-1.5 rounded-panel border border-steel-700 bg-navy-950/60 px-2 py-3 text-steel-300 " +
    "transition-[color,background-color,border-color,transform] duration-(--duration-slow) ease-(--ease-standard) " +
    "hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-400/10 hover:text-gold-300 " +
    "focus-visible:-translate-y-0.5 focus-visible:border-gold-400 focus-visible:bg-gold-400/10 focus-visible:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300";

  return (
    <GlowCard accent="gold" className="min-h-50 sm:col-span-2 lg:col-span-4">
      <CardTitle>Subjects</CardTitle>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {subjects.map((subject) => {
          const Icon = Icons[subject.icon];
          const content = (
            <>
              <Icon className="size-7" />
              <span className="text-xs font-medium text-steel-100">{subject.name}</span>
            </>
          );
          const handlers = {
            onMouseEnter: () => setActiveId(subject.id),
            onMouseLeave: () => setActiveId(null),
            onFocus: () => setActiveId(subject.id),
            onBlur: () => setActiveId(null),
          };
          return (
            <li key={subject.id}>
              {subject.href ? (
                <Link href={subject.href} className={chip} {...handlers}>
                  {content}
                </Link>
              ) : (
                <div className={chip} {...handlers}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 min-h-5 text-sm text-steel-300" aria-live="polite">
        {active ? (
          <span key={active.id} className="bento-fade">
            {active.description}
          </span>
        ) : (
          "Hover or tab to a subject to see what it covers."
        )}
      </p>
    </GlowCard>
  );
}

/* ==========================================================================
   Main export
   ========================================================================== */

export function PerformanceBento({
  scores,
  subjectStats,
  log,
  rings,
  daily,
  subjects,
  eyebrow = "Cadet performance",
  heading = "Your preparation at a glance",
  intro = "Scores, accuracy and daily practice in one view.",
  sample = false,
  className,
}: PerformanceBentoProps) {
  return (
    <section className={cn("w-full px-4 py-14 text-steel-100 sm:px-8 sm:py-20", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gold-300">{eyebrow}</p>
            {sample ? <Badge variant="outline">Sample data</Badge> : null}
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{heading}</h2>
          <p className="mt-3 text-steel-300">{intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-52 lg:grid-cols-4">
          <ScoreTrendCard scores={scores} subjectStats={subjectStats} />
          <MissionLogCard log={log} />
          <AccuracyCard rings={rings} />
          <DailyCard daily={daily} />
          <SubjectsCard subjects={subjects} />
        </div>
      </div>
    </section>
  );
}

export default PerformanceBento;