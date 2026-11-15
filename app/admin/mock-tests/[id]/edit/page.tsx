import type { Metadata } from "next";
import { Suspense } from "react";
import { MockTestForm } from "@/components/admin/mock-tests/mock-test-form";

export const metadata: Metadata = {
  title: "Edit Mock Test | EARTH SP NDA",
  description: "Edit a mock test and its questions.",
};

// One placeholder keeps the build able to prerender the page shell; real ids are rendered on request.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

// Reading params is request data, so it sits inside Suspense: the page shell can then be served instantly.
async function EditMockTestContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MockTestForm testId={id} />;
}

export default function EditMockTestPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <EditMockTestContent params={params} />
    </Suspense>
  );
}
