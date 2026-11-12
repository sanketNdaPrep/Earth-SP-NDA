"use client";

import * as React from "react";
import { MotionConfig, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";

const WORDS = ["NDA", "CDS", "AFCAT", "SSB"];

/** Hero-style line. The flip sits inside a real heading; a separate button controls the rotation. */
export function LayoutTextFlipDemo() {
  const [paused, setPaused] = React.useState(false);
  return (
    <MotionConfig reducedMotion="user">
      <section className="flex w-full flex-col items-center gap-4 px-4 py-12 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-3xl font-semibold text-white sm:text-4xl"
        >
          <LayoutTextFlip text="Prepare for" words={WORDS} paused={paused} />
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          className="max-w-md text-base leading-relaxed text-steel-300"
        >
          Free notes and mock tests for aspirants who study on their own.
        </motion.p>

        <Button variant="secondary" size="sm" onClick={() => setPaused((p) => !p)}>
          {paused ? "Play animation" : "Pause animation"}
        </Button>
      </section>
    </MotionConfig>
  );
}

/** Standalone use with the built-in pause and play button. */
export function LayoutTextFlipControlDemo() {
  return (
    <p className="text-xl font-semibold text-white">
      <LayoutTextFlip text="Prepare for" words={WORDS} showControl />
    </p>
  );
}

/** Fixed-width pill: nothing around it moves when the word changes. */
export function LayoutTextFlipFixedDemo() {
  return (
    <p className="text-xl font-semibold text-white">
      <LayoutTextFlip text="Prepare for" words={WORDS} fixedWidth />
    </p>
  );
}

/** Single word, and long words for narrow screens. */
export function LayoutTextFlipEdgeDemo() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl font-semibold text-white">
        <LayoutTextFlip text="Starting with" words={["Mathematics"]} />
      </p>
      <p className="text-xl font-semibold text-white">
        <LayoutTextFlip
          text="Revise"
          words={["General ability test papers", "Physics and chemistry notes", "English comprehension drills"]}
        />
      </p>
    </div>
  );
}

export default LayoutTextFlipDemo;