import type { Metadata } from "next";
import { QuestionForm } from "@/components/admin/questions/question-form";

export const metadata: Metadata = {
  title: "Add Question | EARTH SP NDA",
  description: "Question Seeding Portal: add a question to a test module.",
};

export default function NewQuestionPage() {
  return <QuestionForm />;
}
