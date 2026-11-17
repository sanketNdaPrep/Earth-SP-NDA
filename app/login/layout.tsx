import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("Log in", "Log in to your EARTH SP NDA account.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
