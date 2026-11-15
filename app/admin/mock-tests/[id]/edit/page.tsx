import type { Metadata } from "next";
import { MockTestForm } from "@/components/admin/mock-tests/mock-test-form";

export const metadata: Metadata = {
  title: "Edit Mock Test | EARTH SP NDA",
  description: "Edit a mock test and its questions.",
};

// One placeholder keeps the build able to prerender the page shell; real ids are rendered on request.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function EditMockTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MockTestForm testId={id} />;
}
