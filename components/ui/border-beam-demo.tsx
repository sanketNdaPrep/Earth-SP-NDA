import * as React from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SAMPLES = [
  { title: "Default", note: "6s lap, 120px beam.", beam: {} },
  { title: "Fast and long", note: "3s lap, 220px beam.", beam: { duration: 3, size: 220 } },
  { title: "Reverse", note: "Counter-clockwise, 5s lap.", beam: { duration: 5, reverse: true } },
  { title: "Two beams", note: "Opposite directions, one delayed.", beam: { duration: 6 }, second: { duration: 6, reverse: true, delay: 3 } },
] as const;

/** Server-rendered preview of BorderBeam options. Reduced motion hides the beams entirely. */
export function BorderBeamDemo() {
  return (
    <ul className="grid w-full max-w-3xl list-none gap-6 p-0 sm:grid-cols-2">
      {SAMPLES.map((s) => (
        <li key={s.title}>
          <Card className="relative h-full overflow-hidden">
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>{s.note}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-steel-500 text-xs">The parent needs relative and overflow-hidden.</p>
            </CardContent>
            <BorderBeam {...s.beam} />
            {"second" in s ? <BorderBeam {...s.second} /> : null}
          </Card>
        </li>
      ))}
    </ul>
  );
}