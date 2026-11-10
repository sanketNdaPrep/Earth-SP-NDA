import * as React from "react";
import { RadialProgress, type RadialProgressProps } from "@/components/ui/radial-progress";

/** A ring with its caption underneath. The ring itself carries the accessible name. */
function Item({ caption, ...props }: RadialProgressProps & { caption: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <RadialProgress {...props} />
      <p className="max-w-28 text-center text-xs text-steel-300">{caption}</p>
    </div>
  );
}

const STEPS = [0, 20, 60, 20, 100] as const;

/** The reference values (one repeated on purpose to prove duplicates are fine). */
export function RadialValuesDemo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      {STEPS.map((value, index) => (
        <Item key={index} caption="Syllabus covered" label="Syllabus covered" value={value} />
      ))}
    </div>
  );
}

/** Tones, sizes, thickness and custom centre text. */
export function RadialGalleryDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start gap-6">
        <Item caption="Questions attempted" label="Questions attempted" value={45} />
        <Item caption="Accuracy, strong" label="Accuracy, strong" value={82} tone="emerald" />
        <Item caption="Accuracy, fair" label="Accuracy, fair" value={68} tone="gold" />
        <Item caption="Accuracy, weak" label="Accuracy, weak" value={31} tone="danger" />
      </div>
      <div className="flex flex-wrap items-end gap-6">
        <Item caption="Small" label="Syllabus covered, small" value={65} size="sm" />
        <Item caption="Medium" label="Syllabus covered, medium" value={65} size="md" />
        <Item caption="Large" label="Syllabus covered, large" value={65} size="lg" />
        <Item caption="Thin ring" label="Syllabus covered, thin" value={65} size="lg" thickness="thin" tone="gold" />
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <Item
          caption="Custom centre"
          label="Questions answered"
          value={12}
          max={20}
          size="lg"
          tone="emerald"
          valueText="12 of 20 questions answered"
        >
          12/20
        </Item>
        <Item caption="Below zero, clamped" label="Below zero example" value={-20} />
        <Item caption="Above max, clamped" label="Above maximum example" value={140} />
      </div>
    </div>
  );
}

export default RadialValuesDemo;