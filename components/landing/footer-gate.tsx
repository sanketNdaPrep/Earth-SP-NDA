"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/landing/site-footer";

/** The footer shows on public and student pages. It stays out of the admin area and out of a test being taken. */
export function FooterGate() {
  const path = usePathname() ?? "/";
  if (path.startsWith("/admin") || path.startsWith("/quiz/") || path.startsWith("/dev")) return null;
  return <SiteFooter />;
}
