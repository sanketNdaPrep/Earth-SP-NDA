import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta("Mock Tests", "Timed practice papers for NDA, CDS and AFCAT.");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
