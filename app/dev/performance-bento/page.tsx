import { notFound } from "next/navigation";
import { PerformanceBento, type PerformanceBentoProps } from "@/components/ui/performance-bento";

export const metadata = { title: "Performance bento (dev only)", robots: { index: false } };

/** Sample numbers for the preview only. Real data will come from the dashboard hooks later. */
const SAMPLE: PerformanceBentoProps = {
  scores: [38, 42, 41, 49, 53, 51, 58, 62, 60, 67, 71, 74].map((score, i) => ({
    label: `Mock ${String(i + 1).padStart(2, "0")}`,
    score,
  })),
  subjectStats: [
    { name: "Algebra", accuracy: 82 },
    { name: "Trigonometry", accuracy: 68 },
    { name: "Calculus", accuracy: 45 },
    { name: "Vectors", accuracy: 74 },
  ],
  log: [
    { text: "Finished NDA Maths Mock 12", detail: "Today" },
    { text: "Reviewed 9 mistakes in Calculus", detail: "Today" },
    { text: "Attempted GAT English Set 5", detail: "Yesterday" },
    { text: "Practised 40 Vectors questions", detail: "Yesterday" },
    { text: "Finished NDA Maths Mock 11", detail: "2 days ago" },
    { text: "Revised Trigonometry identities", detail: "3 days ago" },
    { text: "Attempted GAT General Knowledge Set 3", detail: "4 days ago" },
  ],
  rings: [
    { label: "Maths", value: 74 },
    { label: "English", value: 81 },
    { label: "GK", value: 66 },
    { label: "Science", value: 58 },
  ],
  daily: [20, 35, 0, 42, 50, 28, 60, 45, 38, 0, 55, 64, 48, 70, 52, 66].map((count, i, all) => ({
    label: i === all.length - 1 ? "Today" : `Day ${i + 1}`,
    count,
  })),
  subjects: [
    { id: "algebra", name: "Algebra", icon: "sigma", description: "Sets, complex numbers, matrices and quadratic equations.", href: "/quizzes" },
    { id: "trig", name: "Trigonometry", icon: "triangle", description: "Identities, heights and distances, and inverse functions.", href: "/quizzes" },
    { id: "calculus", name: "Calculus", icon: "calculator", description: "Limits, differentiation and integration.", href: "/quizzes" },
    { id: "vectors", name: "Vectors", icon: "target", description: "Dot and cross products and three-dimensional geometry.", href: "/quizzes" },
    { id: "physics", name: "Physics", icon: "atom", description: "Mechanics, heat, light, sound and electricity.", href: "/quizzes" },
    { id: "chemistry", name: "Chemistry", icon: "flask", description: "Atomic structure, reactions and everyday organic chemistry.", href: "/quizzes" },
    { id: "history", name: "History", icon: "landmark", description: "Ancient, medieval and modern India, plus key world events.", href: "/quizzes" },
    { id: "geography", name: "Geography", icon: "globe", description: "Physical, Indian and world geography.", href: "/quizzes" },
  ],
  sample: true,
};

export default function PerformanceBentoDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="min-h-screen overflow-x-hidden">
      <PerformanceBento {...SAMPLE} />
    </main>
  );
}