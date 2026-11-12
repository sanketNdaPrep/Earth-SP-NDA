import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-gold-400", className)}>
      <Icons.logo className="size-7" />
      <span className="font-mono text-sm font-bold uppercase tracking-widest text-white">EARTH SP NDA</span>
    </div>
  );
}

export default BrandMark;