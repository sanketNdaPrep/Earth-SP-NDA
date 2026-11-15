import type { Metadata } from "next";
import { Suspense } from "react";
import { QuestionForm } from "@/components/admin/questions/question-form";

export const metadata: Metadata = {
  title: "Edit Question | EARTH SP NDA",
  description: "Question Seeding Portal: edit a question in the bank.",
};

// One placeholder keeps the build able to prerender the page shell; real ids are rendered on request.
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

// Reading params is request data, so it sits inside Suspense: the page shell can then be served instantly.
async function EditQuestionContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuestionForm questionId={id} />;
}

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <EditQuestionContent params={params} />
    </Suspense>
  );
}
