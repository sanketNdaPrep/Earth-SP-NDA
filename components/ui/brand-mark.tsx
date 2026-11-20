import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

/** The EARTH SP NDA logo. It always links to the home page. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="EARTH SP NDA home"
      className={cn(
        "flex items-center justify-center gap-2 rounded-control text-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400",
        className,
      )}
    >
      <Icons.logo className="size-7" />
      <span className="font-mono text-sm font-bold uppercase tracking-widest text-white">EARTH SP NDA</span>
    </Link>
  );
}

export default BrandMark;
