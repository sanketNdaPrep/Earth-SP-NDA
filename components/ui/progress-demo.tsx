import * as React from "react";
import { Progress, type ProgressProps } from "@/components/ui/progress";

const PROGRESS_VALUES = [0, 10, 40, 70, 100] as const;

/** A caption above a bar. The bar itself carries the accessible name. */
function Row({ caption, ...props }: ProgressProps & { caption: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-steel-300">{caption}</p>
      <Progress {...props} />
    </div>
  );
}

/** The five values from the reference, with real labels and the visible percent. */
export function ProgressValuesDemo() {
  return (
    <div className="flex flex-col gap-4">
      {PROGRESS_VALUES.map((val) => (
        <Row key={val} caption="Syllabus covered" label="Syllabus covered" value={val} showValue />
      ))}
    </div>
  );
}

/** Tones and sizes. */
export function ProgressTonesDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Row caption="Questions attempted" label="Questions attempted" value={40} showValue />
      <Row caption="Mock test accuracy, strong" label="Mock test accuracy, strong" value={82} tone="emerald" showValue />
      <Row caption="Mock test accuracy, fair" label="Mock test accuracy, fair" value={68} tone="gold" showValue />
      <Row caption="Mock test accuracy, weak" label="Mock test accuracy, weak" value={31} tone="danger" showValue />
      <Row caption="Small size" label="Syllabus covered, small" value={55} size="sm" showValue />
    </div>
  );
}

/** Loading and edge values. */
export function ProgressEdgeDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Row caption="Loading your results" label="Loading your results" />
      <Row caption="Below zero, clamped to 0" label="Below zero example" value={-20} showValue />
      <Row caption="Above the maximum, clamped to 100" label="Above maximum example" value={140} showValue />
      <Row caption="Custom maximum: 25 of 50 questions" label="Questions answered" value={25} max={50} showValue />
    </div>
  );
}

export default ProgressValuesDemo;