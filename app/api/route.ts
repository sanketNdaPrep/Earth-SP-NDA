import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data: mockTests, error } = await supabase
    .from("mock_tests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ mockTests });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("mock_tests")
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ mockTest: data });
}