import type { Metadata } from "next";
import { Suspense } from "react";
import { MockTestForm } from "@/components/admin/mock-tests/mock-test-form";
import { TEST_KINDS, type TestKind } from "@/lib/test-settings";

export const metadata: Metadata = {
  title: "Add a Test | EARTH SP NDA",
  description: "Build a full mock, subject-wise or chapter-wise test from a PDF, typed questions or the bank.",
};

// The Question Bank opens this page with ?kind=mock, subject or chapter, so the right type is already chosen.
async function NewTestContent({ searchParams }: { searchParams: Promise<{ kind?: string | string[] }> }) {
  const { kind } = await searchParams;
  const asked = Array.isArray(kind) ? kind[0] : kind;
  const initialKind = TEST_KINDS.find((k) => k === asked) as TestKind | undefined;
  return <MockTestForm initialKind={initialKind} />;
}

export default function NewMockTestPage({ searchParams }: { searchParams: Promise<{ kind?: string | string[] }> }) {
  return (
    <Suspense fallback={null}>
      <NewTestContent searchParams={searchParams} />
    </Suspense>
  );
}
