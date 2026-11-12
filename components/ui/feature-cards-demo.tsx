"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { FeatureCardFan, type Feature } from "@/components/ui/feature-cards";

const FEATURES: Feature[] = [
  {
    category: "General Ability",
    title: "GAT Practice",
    badges: ["+4 / -1.33"],
    icon: "book",
    tone: "emerald",
    href: "/quizzes",
  },
  {
    category: "Mathematics",
    title: "NDA Maths Paper",
    badges: ["+2.5 / -0.83"],
    icon: "calculator",
    tone: "gold",
    href: "/quizzes",
  },
  {
    category: "Officer Entry",
    title: "CDS and AFCAT Mocks",
    badges: ["CDS +1 / -0.33", "AFCAT +3 / -1"],
    icon: "plane",
    tone: "steel",
    href: "/quizzes",
  },
];

/** Showcase section: headline, call to action and the fanned feature cards. */
export function FeatureCardsDemo() {
  const reduceMotion = useReducedMotion();
  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.5, delay } };

  return (
    <section className="flex w-full flex-col items-center gap-4 py-12">
      <motion.header {...enter(0)} className="flex max-w-md flex-col items-center gap-2 px-4 text-center">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Practise the way the paper marks you</h2>
        <p className="text-balance text-base text-steel-300 sm:text-lg">
          Timed mocks with the real marking scheme for each exam, so your practice score means something.
        </p>
      </motion.header>

      <motion.div {...enter(0.1)}>
        <Button asChild size="lg">
          <Link href="/quizzes">
            Start a mock test
            <Icons.chevronRight className="size-4" />
          </Link>
        </Button>
      </motion.div>

      <FeatureCardFan features={FEATURES} />
    </section>
  );
}