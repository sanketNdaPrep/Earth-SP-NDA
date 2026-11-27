"use client";

import * as React from "react";
import { MathText } from "@/components/quiz/math-text";
import { KEY_GROUPS } from "@/lib/math-insert";
import { cn } from "@/lib/utils";

interface Props {
  /** Name of the box being typed in, like "Option B". */
  target: string;
  /** What that box holds now, shown drawn as a student would see it. */
  value: string;
  onInsert: (tex: string) => void;
  onStep: (dir: -1 | 1) => void;
}

const KEY =
  "inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-control border border-steel-700 bg-navy-950 px-2 text-sm text-steel-100 " +
  "transition-colors duration-(--duration-base) ease-(--ease-standard) hover:border-gold-400 active:bg-navy-800 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40";

/** Keys for typing maths. They put LaTeX into the box last tapped, and show the result drawn. */
export function MathKeyboard({ target, value, onInsert, onStep }: Props) {
  const [group, setGroup] = React.useState(KEY_GROUPS[0].id);
  const current = KEY_GROUPS.find((g) => g.id === group) ?? KEY_GROUPS[0];
  // Tapping a key must not take the cursor out of the box.
  const keep = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div role="group" aria-label="Maths keyboard" className="sticky bottom-0 z-10 space-y-2 rounded-control border border-steel-700 bg-navy-900 p-2 shadow-lg">
      <div className="max-h-24 overflow-auto rounded-control bg-navy-950 px-3 py-2 text-sm text-white" aria-live="polite">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-steel-500">How {target} looks</p>
        {value.trim() ? <MathText text={value} /> : <span className="text-steel-500">Nothing typed yet.</span>}
      </div>

      <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Kinds of keys">
        {KEY_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === group}
            onMouseDown={keep}
            onClick={() => setGroup(g.id)}
            className={cn(
              "h-8 shrink-0 rounded-control px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40",
              g.id === group ? "bg-gold-400 text-navy-950" : "text-steel-300 hover:text-white",
            )}
          >
            {g.title}
          </button>
        ))}
        <span className="ml-auto flex shrink-0 gap-1 pl-2">
          <button type="button" className={KEY} onMouseDown={keep} onClick={() => onStep(-1)} aria-label="Move the cursor left">
            ◀
          </button>
          <button type="button" className={KEY} onMouseDown={keep} onClick={() => onStep(1)} aria-label="Move the cursor right">
            ▶
          </button>
        </span>
      </div>

      <div role="tabpanel" className="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
        {current.keys.map((key) => (
          <button key={key.name} type="button" className={KEY} title={key.name} aria-label={key.name} onMouseDown={keep} onClick={() => onInsert(key.tex)}>
            {key.label}
          </button>
        ))}
      </div>
      <p className="hidden text-xs text-steel-500 sm:block">Tap a box, then a key. Select some text first to put it inside the key (like a fraction or a root).</p>
    </div>
  );
}
