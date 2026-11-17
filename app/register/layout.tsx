import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("Create account", "Create a free EARTH SP NDA account to track your preparation.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
