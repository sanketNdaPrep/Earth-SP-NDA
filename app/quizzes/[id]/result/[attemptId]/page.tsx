import type { Metadata } from "next";
import { Suspense } from "react";
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

// Reading params is request data, so it sits inside Suspense: the page shell can then be served instantly.
async function MockResultContent({ params }: { params: Promise<{ id: string; attemptId: string }> }) {
  const { attemptId } = await params;
  return <ResultView attemptId={attemptId} />;
}

export default function MockResultPage({ params }: { params: Promise<{ id: string; attemptId: string }> }) {
  return (
    <Suspense fallback={null}>
      <MockResultContent params={params} />
    </Suspense>
  );
}
