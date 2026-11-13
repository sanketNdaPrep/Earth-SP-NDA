import { NextResponse } from "next/server";
import { getAdminStatus } from "@/lib/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const fail = (error: string, status: number) =>
  NextResponse.json({ ok: false, error }, { status });

/** Returns the signed-in approved admin, or null. */
async function requireApprovedAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return getAdminStatus(user) === "approved" ? user : null;
}

export async function GET() {
  const me = await requireApprovedAdmin();
  if (!me) return fail("Not allowed.", 403);

  const admin = createSupabaseAdminClient();
  if (!admin) return fail("Server is not configured for admin approvals.", 503);

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) return fail(error.message, 500);

  const admins = data.users
    .filter((u) => u.app_metadata?.role === "admin")
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      fullName: (u.user_metadata?.full_name as string | undefined) ?? "",
      createdAt: u.created_at,
      approved: u.app_metadata?.is_approved === true,
    }))
    .sort((a, b) => Number(a.approved) - Number(b.approved) || b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({ ok: true, admins, meId: me.id });
}

export async function POST(request: Request) {
  const me = await requireApprovedAdmin();
  if (!me) return fail("Not allowed.", 403);

  let body: { userId?: string; approve?: boolean };
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }
  if (!body.userId || typeof body.approve !== "boolean") return fail("Invalid request.", 400);
  if (body.userId === me.id && !body.approve) return fail("You cannot remove your own access.", 400);

  const admin = createSupabaseAdminClient();
  if (!admin) return fail("Server is not configured for admin approvals.", 503);

  const { data: target, error: findError } = await admin.auth.admin.getUserById(body.userId);
  if (findError || !target.user) return fail("Admin account not found.", 404);
  if (target.user.app_metadata?.role !== "admin") return fail("That account is not an admin request.", 400);

  const { error } = await admin.auth.admin.updateUserById(body.userId, {
    app_metadata: { ...target.user.app_metadata, is_approved: body.approve },
  });
  if (error) return fail(error.message, 500);

  return NextResponse.json({ ok: true });
}
