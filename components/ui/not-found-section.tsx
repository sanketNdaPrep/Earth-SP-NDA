import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoBackButton } from "@/components/ui/go-back-button";
import { cn } from "@/lib/utils";

export interface NotFoundLink {
  label: string;
  href: string;
  description?: string;
}

export interface NotFoundSectionProps {
  /** Small label above the heading. */
  code?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  /** Optional list of useful pages shown under the actions. */
  links?: NotFoundLink[];
  /** Show the "Go back" button. Default true. */
  showBack?: boolean;
  className?: string;
}

/**
 * "Page not found" screen. A server component: only the back button is client-side.
 * It fills the height its parent gives it (the root layout is a flex column), so it never adds its own
 * screen-high box and cannot cause a double scroll.
 */
export function NotFoundSection({
  code = "404 error",
  title = "Page not found",
  description = "That link may be broken or the page has moved. Pick up where you left off below.",
  homeHref = "/",
  links,
  showBack = true,
  className,
}: NotFoundSectionProps) {
  return (
    <main className={cn("flex flex-1 items-center justify-center px-6 py-12", className)}>
      <div className="w-full max-w-md">
        <p className="font-mono text-sm font-semibold uppercase tracking-wider text-gold-300">{code}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white md:text-3xl">{title}</h1>
        <p className="mt-4 text-steel-300">{description}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {showBack ? <GoBackButton homeHref={homeHref} /> : null}
          <Button asChild>
            <Link href={homeHref}>Take me home</Link>
          </Button>
        </div>

        {links && links.length > 0 ? (
          <nav aria-label="Helpful pages" className="mt-10 border-t border-steel-700 pt-6">
            <h2 className="font-mono text-xs uppercase tracking-wider text-steel-300">Popular pages</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-control border border-steel-700 bg-navy-900 px-4 py-3 transition-colors duration-(--duration-base) ease-(--ease-standard) hover:border-steel-500 hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                  >
                    <span className="block text-sm font-semibold text-white">{link.label}</span>
                    {link.description ? (
                      <span className="mt-0.5 block text-sm text-steel-300">{link.description}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </main>
  );
}

export default NotFoundSection;