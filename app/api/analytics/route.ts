import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: progress, error } = await supabase
    .from("subject_progress")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate overall metrics
  const totalAttempted = progress?.reduce((acc, curr) => acc + curr.total_questions_attempted, 0) || 0;
  const totalCorrect = progress?.reduce((acc, curr) => acc + curr.correct_answers, 0) || 0;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return NextResponse.json({
    metrics: {
      totalAttempted,
      totalCorrect,
      overallAccuracy,
      subjectBreakdown: progress || [],
    },
  });
}