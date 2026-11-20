"use client";

import { usePathname } from "next/navigation";
import { parentOf } from "@/lib/back-path";
import { GoBackButton } from "@/components/ui/go-back-button";

/** Pages where a back button would be pointless or risky (home, and a quiz being taken). */
function hidden(path: string): boolean {
  return path === "/" || path.startsWith("/quiz/");
}

/** One slim Back bar above every page except home, so students and admins can always step back. */
export function BackBar() {
  const path = usePathname() ?? "/";
  if (hidden(path)) return null;
  return (
    <div className="border-b border-steel-700/60 bg-navy-950">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-1.5 md:px-8">
        <GoBackButton variant="ghost" size="sm" homeHref={parentOf(path)}>
          Back
        </GoBackButton>
      </div>
    </div>
  );
}

export default BackBar;
