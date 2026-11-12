import * as React from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface FooterLinkData {
  title: string;
  href: string;
}

export interface FooterColumnData {
  /** Names the column's navigation landmark and is shown as its title. */
  title: string;
  links: FooterLinkData[];
  /** Optional prominent row at the top of the column, with an arrow. */
  highlight?: FooterLinkData;
}

export interface FooterProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** One to four columns. */
  columns: FooterColumnData[];
  /** Optional brand block shown above the columns. */
  brand?: React.ReactNode;
  /** Optional legal text, such as a disclaimer, shown under the columns. */
  legal?: React.ReactNode;
  /** Required so the server render never depends on the current date. */
  year: number;
  /** Name shown in the copyright line. */
  owner: string;
  /** Optional short credit after the copyright, for example "Made by Sanket." */
  credit?: string;
}

const columnCountClasses: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const focusClasses =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

function FooterAnchor({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/**
 * A footer made of up to four link columns, with an optional brand block and legal line.
 * Prop-driven, so it carries no built-in links. Each column is its own `nav` landmark,
 * named by its title. Server component: no client JavaScript.
 */
export function Footer({ columns, brand, legal, year, owner, credit, className, ...props }: FooterProps) {
  const count = Math.min(Math.max(columns.length, 1), 4);
  return (
    <footer className={cn("border-t border-steel-700 bg-navy-950 text-steel-100", className)} {...props}>
      <div className="mx-auto max-w-5xl px-4">
        {brand ? <div className="py-8">{brand}</div> : null}
        <div
          className={cn(
            "grid grid-cols-1 divide-y divide-steel-700 border-x border-t border-steel-700 md:divide-x md:divide-y-0",
            columnCountClasses[count],
          )}
        >
          {columns.slice(0, 4).map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col">
              {column.highlight ? (
                <FooterAnchor
                  href={column.highlight.href}
                  className={cn(
                    "group flex items-center justify-between gap-2 border-b border-steel-700 px-4 py-3 text-sm font-medium text-steel-100",
                    "transition-colors duration-fast ease-standard hover:bg-navy-900",
                    focusClasses,
                  )}
                >
                  <span>{column.highlight.title}</span>
                  <Icons.arrowRight className="size-4 text-steel-300 transition-transform duration-fast ease-standard group-hover:text-steel-100 motion-safe:group-hover:translate-x-0.5" />
                </FooterAnchor>
              ) : null}
              <div className="px-4 py-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-steel-300">{column.title}</p>
                <ul className="flex flex-col">
                  {column.links.map((link) => (
                    <li key={`${link.title}-${link.href}`}>
                      <FooterAnchor
                        href={link.href}
                        className={cn(
                          "block rounded-control py-1.5 text-sm text-steel-300 transition-colors duration-fast ease-standard hover:text-steel-100",
                          focusClasses,
                        )}
                      >
                        {link.title}
                      </FooterAnchor>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          ))}
        </div>
        {legal ? (
          <div className="border-x border-t border-steel-700 px-4 py-6">
            <div className="max-w-3xl text-sm leading-relaxed text-steel-300">{legal}</div>
          </div>
        ) : null}
      </div>
      <div className="flex justify-center border-t border-steel-700 px-4 py-3">
        <p className="text-xs text-steel-300">
          © {year} <span translate="no">{owner}</span>.{credit ? ` ${credit}` : ""}
        </p>
      </div>
    </footer>
  );
}