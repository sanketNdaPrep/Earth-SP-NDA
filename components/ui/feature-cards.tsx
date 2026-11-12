"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { FEATURE_CARD_SHELL, FeatureCardFace, type Feature } from "@/components/ui/feature-card-face";
import { cn } from "@/lib/utils";

export type { Feature, FeatureTone } from "@/components/ui/feature-card-face";

export interface FeatureCardProps {
  feature: Feature;
  className?: string;
  delay?: number;
}

export function FeatureCard({ feature, className, delay = 0 }: FeatureCardProps) {
  const { href } = feature;
  const reduceMotion = useReducedMotion();
  const spring = useSpring(0, { bounce: 0 });
  const zIndex = useTransform(spring, (v) => Math.floor(v * 10) + 10);
  const scale = useTransform(spring, [0, 1], [1, 1.1]);

  const raise = () => {
    if (!reduceMotion) spring.set(1);
  };
  const lower = () => spring.set(0);

  return (
    <motion.div
      style={{ zIndex }}
      onPointerEnter={(e) => e.pointerType === "mouse" && raise()}
      onPointerLeave={(e) => e.pointerType === "mouse" && lower()}
      onFocus={raise}
      onBlur={lower}
      data-card="outer"
      className={cn("relative", className)}
    >
      <motion.div
        data-card="inner"
        style={{ scale }}
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", delay }}
      >
        {href ? (
          <Link href={href} className={FEATURE_CARD_SHELL}>
            <FeatureCardFace feature={feature} />
          </Link>
        ) : (
          <div className={FEATURE_CARD_SHELL}>
            <FeatureCardFace feature={feature} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

const FAN_POSITIONS = [
  "sm:translate-x-8 sm:translate-y-2.5 sm:-rotate-6 sm:scale-95",
  "",
  "sm:-translate-x-8 sm:translate-y-2.5 sm:rotate-6 sm:scale-95",
];
const FAN_DELAYS = [0.3, 0.1, 0.5];

export function FeatureCardFan({ features, className }: { features: Feature[]; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-8 px-4 py-12 sm:flex-row sm:justify-center sm:gap-0", className)}>
      {features.map((feature, i) => (
        <FeatureCard
          key={feature.title}
          feature={feature}
          className={FAN_POSITIONS[i]}
          delay={FAN_DELAYS[i] ?? 0.1 * i}
        />
      ))}
    </div>
  );
}