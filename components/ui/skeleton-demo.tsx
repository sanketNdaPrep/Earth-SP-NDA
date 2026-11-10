"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { SkeletonMediaCard } from "@/components/ui/skeleton-media-card";
import type { SkeletonAnimation } from "@/components/ui/skeleton";

/** The real card the skeleton stands in for. Same title, description and media row sizes. */
function LoadedCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold leading-6">NDA Maths mock test 4</CardTitle>
        <CardDescription className="leading-5">100 questions, 150 minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          data-testid="loaded-media"
          className="flex aspect-video w-full items-center justify-center rounded-control border border-steel-700 bg-navy-800 font-mono text-xs uppercase tracking-wider text-steel-300"
        >
          Preview
        </div>
      </CardContent>
    </Card>
  );
}

/** Toggle between the skeleton and the loaded card to check the layout does not jump. */
export function SkeletonToggleDemo({ animation }: { animation?: SkeletonAnimation }) {
  const [loading, setLoading] = React.useState(true);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="secondary" onClick={() => setLoading((v) => !v)}>
          {loading ? "Show loaded card" : "Show skeleton"}
        </Button>
      </div>
      <div data-testid="toggle-slot" className="w-full max-w-xs">
        {loading ? <SkeletonCard label="Loading mock test" animation={animation} /> : <LoadedCard />}
      </div>
    </div>
  );
}

/** The real image-first tile the media skeleton stands in for. Same row sizes. */
function LoadedMediaTile({ bordered }: { bordered: boolean }) {
  const inner = (
    <>
      <div
        data-testid="loaded-media-tile"
        className="flex aspect-video w-full items-center justify-center rounded-control border border-steel-700 bg-navy-800 font-mono text-xs uppercase tracking-wider text-steel-300"
      >
        Paper preview
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold leading-6 text-white">Previous year paper, GAT</h3>
        <p className="truncate text-sm leading-5 text-steel-300">General ability test, 150 questions</p>
        <p className="truncate text-sm leading-5 text-steel-300">Solved with explanations</p>
      </div>
    </>
  );
  return bordered ? (
    <Card className="w-full">
      <div className="flex flex-col gap-3 p-4">{inner}</div>
    </Card>
  ) : (
    <div className="flex w-full flex-col gap-3">{inner}</div>
  );
}

/** Toggle between the media skeleton and the loaded tile to check the layout does not jump. */
export function SkeletonMediaToggleDemo({
  bordered = false,
  animation,
  testId = "media-slot",
}: {
  bordered?: boolean;
  animation?: SkeletonAnimation;
  testId?: string;
}) {
  const [loading, setLoading] = React.useState(true);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="secondary" onClick={() => setLoading((v) => !v)}>
          {loading ? `Show loaded tile${bordered ? " (bordered)" : ""}` : `Show skeleton${bordered ? " (bordered)" : ""}`}
        </Button>
      </div>
      <div data-testid={testId} className="w-full max-w-xs">
        {loading ? (
          <SkeletonMediaCard label="Loading paper" bordered={bordered} animation={animation} />
        ) : (
          <LoadedMediaTile bordered={bordered} />
        )}
      </div>
    </div>
  );
}

export default SkeletonToggleDemo;