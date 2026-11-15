import type { Metadata } from "next";
import { Suspense } from "react";
import { TestRunner } from "@/components/mock-test/test-runner";

export const metadata: Metadata = {
  title: "Mock Test | EARTH SP NDA",
  robots: { index: false, follow: false },
};

// One placeholder keeps the build able to prerender the page shell; real ids are rendered on request.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

// Reading params is request data, so it sits inside Suspense: the page shell can then be served instantly.
async function MockTestContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TestRunner testId={id} />;
}

export default function MockTestPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <MockTestContent params={params} />
    </Suspense>
  );
}
