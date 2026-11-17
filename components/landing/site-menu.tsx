"use client";

import * as React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/ui/icons";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useAuthState } from "@/components/landing/header-actions";

const EXPLORE: { label: string; href: string }[] = [
  { label: "Free mock tests", href: "/quizzes" },
  { label: "Free notes and study material", href: "/study-material" },
  { label: "Flashcards", href: "/flashcards" },
  { label: "Preparation roadmap", href: "/#roadmap" },
  { label: "About the exams", href: "/#exams" },
  { label: "About the syllabus", href: "/exams/nda#syllabus" },
];

/**
 * The three-line menu at the top right of public pages.
 * Everyone sees the same pages. Signed-out visitors also get Create account and Log in.
 * "Apply for mentorship" opens the Ask a Mentor page; signed-out visitors are sent to log in first.
 */
export function SiteMenu() {
  const auth = useAuthState();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open site menu"
          className="inline-flex size-9 items-center justify-center rounded-control border border-steel-700 text-steel-100 transition-colors hover:border-gold-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
        >
          <Icons.menu className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold-300">Explore</p>
        </DropdownMenuLabel>
        {EXPLORE.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/mentor">Apply for mentorship</Link>
        </DropdownMenuItem>
        {auth.status === "out" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/register">Create account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/login">Log in</Link>
            </DropdownMenuItem>
          </>
        ) : null}
        {auth.status === "in" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">My dashboard</Link>
            </DropdownMenuItem>
          </>
        ) : null}
        <ThemeSwitcher />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
