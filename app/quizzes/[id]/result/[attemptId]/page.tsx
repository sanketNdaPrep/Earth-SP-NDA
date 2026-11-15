import type { Metadata } from "next";
import { ResultView } from "@/components/mock-test/result-view";

// A cadet's personal result stays out of search results.
export const metadata: Metadata = {
  title: "Mock Test Result | EARTH SP NDA",
  robots: { index: false, follow: false },
};

// One placeholder keeps the build able to prerender the page shell; real ids are rendered on request.
export function generateStaticParams() {
  return [{ id: "placeholder", attemptId: "placeholder" }];
}

export default async function MockResultPage({ params }: { params: Promise<{ id: string; attemptId: string }> }) {
  const { attemptId } = await params;
  return <ResultView attemptId={attemptId} />;
}
