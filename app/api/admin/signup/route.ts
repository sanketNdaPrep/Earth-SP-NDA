import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

type Body = {
  mode?: "passcode" | "approval";
  passcode?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  about?: string;
  password?: string;
};

function sameSecret(given: string, expected: string) {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

const fail = (error: string, status: number) =>
  NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return fail("Invalid request.", 400);
  }

  const mode = body.mode === "approval" ? "approval" : "passcode";
  const email = (body.email ?? "").trim().toLowerCase();
  const fullName = (body.fullName ?? "").trim();
  const password = body.password ?? "";

  if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) {
    return fail("Enter your full name and a valid email address.", 400);
  }
  if (password.length < 8) {
    return fail("Password must be at least 8 characters.", 400);
  }

  if (mode === "passcode") {
    const expected = process.env.ADMIN_SIGNUP_PASSCODE;
    if (!expected) {
      return fail("Passcode signup is not configured yet. Use Request Approval.", 503);
    }
    if (!sameSecret((body.passcode ?? "").trim(), expected)) {
      return fail('Invalid Admin Passcode. Switch to "Request Approval" if you do not have one.', 403);
    }
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return fail("Admin signup is not configured on the server yet.", 503);

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone_number: (body.phone ?? "").trim(),
      about: (body.about ?? "").trim(),
    },
    // Only the server can write app_metadata, so a visitor cannot grant themselves this.
    app_metadata: { role: "admin", is_approved: mode === "passcode" },
  });

  if (error) {
    const taken = /already|registered|exists/i.test(error.message);
    return fail(taken ? "An account with this email already exists." : error.message, taken ? 409 : 400);
  }

  return NextResponse.json({ ok: true, approved: mode === "passcode" });
}
