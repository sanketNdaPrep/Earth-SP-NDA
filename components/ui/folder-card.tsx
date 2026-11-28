import * as React from "react";
import Link from "next/link";
import { Icons, type IconProps } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface FolderCardProps {
  title: string;
  description?: string;
  /** Small spaced line at the bottom left, for example "6 subjects". */
  meta?: string;
  /** Text at the bottom right. Default "Open folder". Use "" to hide it. */
  actionLabel?: string;
  icon?: (props: IconProps) => React.ReactElement;
  /** "tint" fills the card softly, so a grid of cards can alternate. */
  tone?: "plain" | "tint";
  /** "sm" is the compact vault tile: no divider or footer. */
  size?: "md" | "sm";
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** A folder or vault card: icon tile, title, one line of text, and a footer with a count and an open link. */
export function FolderCard({
  title,
  description,
  meta,
  actionLabel = "Open folder",
  icon: Icon = Icons.folder,
  tone = "plain",
  size = "md",
  href,
  onClick,
  className,
}: FolderCardProps) {
  const small = size === "sm";
  const classes = cn(
    "group relative flex h-full w-full flex-col rounded-card border text-left shadow-panel transition-[transform,border-color,background-color] duration-(--duration-base) ease-(--ease-standard)",
    "hover:border-gold-400/70 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950",
    tone === "tint" ? "border-steel-700 bg-gold-400/10" : "border-steel-700/70 bg-navy-900",
    small ? "gap-6 p-5" : "gap-5 p-6",
    className,
  );
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex shrink-0 items-center justify-center rounded-tile bg-gold-400/15 text-gold-300", small ? "size-12" : "size-14")}>
          <Icon className={small ? "size-6" : "size-7"} />
        </span>
        {!small ? <Icons.arrowUpRight className="size-5 text-steel-500 transition-colors group-hover:text-gold-300" /> : null}
      </div>
      <div className={cn("min-w-0 space-y-1.5", small ? "mt-auto" : "")}>
        <p className="flex items-center justify-between gap-2 font-display text-2xl font-bold tracking-tight text-white">
          {title}
          {small ? <Icons.arrowUpRight className="size-5 shrink-0 text-steel-500 transition-colors group-hover:text-gold-300" /> : null}
        </p>
        {description ? <p className="text-sm leading-relaxed text-steel-300">{description}</p> : null}
      </div>
      {!small && (meta || actionLabel) ? (
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-steel-700/70 pt-4 text-xs">
          <span className="font-semibold uppercase tracking-widest text-gold-300">{meta}</span>
          <span className="font-semibold text-steel-500 transition-colors group-hover:text-gold-300">{actionLabel}</span>
        </div>
      ) : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {body}
    </button>
  );
}
