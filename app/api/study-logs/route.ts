import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: studyLogs, error } = await supabase
    .from("study_logs")
    .select("*")
    .order("logged_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ studyLogs });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("study_logs")
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ studyLog: data });
}