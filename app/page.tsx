import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { StackedSectionsDemo } from "@/components/ui/stacked-sections-demo";
import { StatsGrid, type StatItem } from "@/components/ui/stats-grid";
import { TimelineDemo } from "@/components/ui/timeline-demo";
import { EntrySchemes, EntrySchemesSkeleton } from "@/components/landing/entry-schemes";
import { HeaderActions } from "@/components/landing/header-actions";
import { FEATURE_ITEMS, HERO_CONTENT } from "@/lib/landing-content";

// Plain facts about the portal. No user counts or accuracy figures: those are only shown once they are real.
const HERO_STATS: StatItem[] = [
  { id: "1", title: "Entry schemes", value: "3", description: "NDA, CDS and AFCAT", icon: "shield" },
  { id: "2", title: "Cost to start", value: "Free", description: "Practice, study material and tracking", icon: "checkCircle" },
  { id: "3", title: "Answer review", value: "After every test", description: "Marks, explanations and weak topics", icon: "target" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-navy-950 text-steel-100">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-steel-700 bg-navy-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-white">
            <Icons.logo className="size-6 text-gold-400" />
            <span>EARTH SP NDA</span>
          </Link>

          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-steel-300 transition-colors hover:text-white">Features</Link>
            <Link href="#exams" className="text-sm font-medium text-steel-300 transition-colors hover:text-white">Exams</Link>
            <Link href="#roadmap" className="text-sm font-medium text-steel-300 transition-colors hover:text-white">Roadmap</Link>
            <Link href="/flashcards" className="text-sm font-medium text-steel-300 transition-colors hover:text-white">Flashcards</Link>
          </nav>

          <HeaderActions />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 md:px-8 md:py-28">
          <div className="stack-grid pointer-events-none absolute inset-0 opacity-40" />
          
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <Badge variant="gold" className="mb-6">
              {HERO_CONTENT.badgeText}
            </Badge>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              {HERO_CONTENT.title}
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-steel-300 sm:text-lg">
              {HERO_CONTENT.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Start Free Practice
                  <Icons.chevronRight className="size-4" />
                </Button>
              </Link>
              <Link href="#roadmap">
                <Button variant="secondary" size="lg">
                  Explore Exam Roadmap
                </Button>
              </Link>
              <Button asChild variant="outline" size="lg">
                <Link href="/study-material">Get Free Study Material</Link>
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <StatsGrid stats={HERO_STATS} label="Platform Stats Overview" />
          </div>
        </section>

        {/* Exam Categories Section */}
        <section id="exams" className="border-t border-steel-700 bg-navy-900/50 px-4 py-16 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-2">Targeted Schemes</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Supported Entry Schemes</h2>
              <p className="mt-2 text-steel-300">Click any entry scheme to view syllabus details and mock test series.</p>
            </div>

            <React.Suspense fallback={<EntrySchemesSkeleton />}>
              <EntrySchemes />
            </React.Suspense>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section id="features" className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <Badge variant="gold" className="mb-2">Tactical Engine</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Engineered for Aspirants</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {FEATURE_ITEMS.map((item) => {
                const IconComponent = Icons[item.iconName as keyof typeof Icons] || Icons.shield;
                return (
                  <div key={item.id} className="rounded-panel border border-steel-700 bg-navy-900 p-6 shadow-panel">
                    <div className="mb-4 inline-flex rounded-control border border-steel-700 bg-navy-950 p-3 text-gold-400">
                      <IconComponent className="size-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-steel-300">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Roadmap Timeline */}
        <section id="roadmap" className="border-t border-steel-700">
          <TimelineDemo />
        </section>

        {/* Stacked Sections Interactive Demo */}
        <section>
          <StackedSectionsDemo />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-steel-700 bg-navy-950 py-10 text-center text-xs text-steel-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p>EARTH SP NDA. Free preparation portal for NDA, CDS and AFCAT aspirants.</p>
        </div>
      </footer>
    </div>
  );
}