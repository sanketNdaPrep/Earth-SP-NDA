import type { Metadata } from "next";
import { TestRunner } from "@/components/mock-test/test-runner";

export const metadata: Metadata = {
  title: "Mock Test | EARTH SP NDA",
  robots: { index: false, follow: false },
};

// One placeholder keeps the build able to prerender the page shell; real ids are rendered on request.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function MockTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TestRunner testId={id} />;
}
