import type { Metadata } from "next";
import { MockTestForm } from "@/components/admin/mock-tests/mock-test-form";

export const metadata: Metadata = {
  title: "Create Mock Test | EARTH SP NDA",
  description: "Build a mock test and attach questions from the bank.",
};

export default function NewMockTestPage() {
  return <MockTestForm />;
}
