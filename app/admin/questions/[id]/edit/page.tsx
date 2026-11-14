import type { Metadata } from "next";
import { QuestionForm } from "@/components/admin/questions/question-form";

export const metadata: Metadata = {
  title: "Edit Question | EARTH SP NDA",
  description: "Question Seeding Portal: edit a question in the bank.",
};

// One placeholder keeps the build able to prerender the page shell; real ids are rendered on request.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuestionForm questionId={id} />;
}
