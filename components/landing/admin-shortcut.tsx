"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/components/landing/header-actions";

/** A button that only approved admins see, so they can jump from a public page to its admin editor. */
export function AdminShortcut({ href, label }: { href: string; label: string }) {
  const auth = useAuthState();
  if (auth.status !== "in" || !auth.isAdmin) return null;
  return (
    <Button asChild variant="gold" size="sm">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
