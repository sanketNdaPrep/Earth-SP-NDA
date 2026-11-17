import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

const EXAMS: Record<string, { title: string; description: string }> = {
  nda: {
    title: "NDA Exam Guide: Pattern and Syllabus",
    description: "Exam pattern, eligibility and syllabus for the National Defence Academy exam, with free notes and flashcards.",
  },
  cds: {
    title: "CDS Exam Guide: Pattern and Syllabus",
    description: "Exam pattern, eligibility and syllabus for the Combined Defence Services exam, with free notes and flashcards.",
  },
  afcat: {
    title: "AFCAT Exam Guide: Pattern and Syllabus",
    description: "Exam pattern, eligibility and syllabus for the Air Force Common Admission Test, with free notes and flashcards.",
  },
};

export function generateStaticParams() {
  return Object.keys(EXAMS).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  // The exam page shows the NDA guide for any unknown id, so the tab title does the same.
  const exam = EXAMS[id.toLowerCase()] ?? EXAMS.nda;
  return pageMeta(exam.title, exam.description);
}

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
