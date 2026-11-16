"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export type AdminSignupInput = {
  mode?: "passcode" | "approval";
  passcode?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  about?: string;
  password?: string;
};

export type AdminSignupResult = { ok: true; approved: boolean } | { ok: false; error: string };

/**
 * SHA-256 of the first passcode this project used. It was shipped to browsers and sits in the
 * git history, so it must never be accepted again, whatever ADMIN_SIGNUP_PASSCODE is set to.
 */
const RETIRED_PASSCODE_SHA256 = "914d73b80d1f8b04390968825ce23aa0d5e6e7eee21a156d0acd7d6f35a31150";

const sha256 = (value: string) => createHash("sha256").update(value).digest();

function sameSecret(given: string, expected: string) {
  return timingSafeEqual(sha256(given), sha256(expected));
}

const fail = (error: string): AdminSignupResult => ({ ok: false, error });
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates an admin account. The passcode is read from the server-only ADMIN_SIGNUP_PASSCODE
 * environment variable and checked here, so it never reaches the browser.
 * A correct passcode activates the account at once; otherwise it waits for approval.
 */
export async function registerAdmin(input: AdminSignupInput): Promise<AdminSignupResult> {
  const mode = input?.mode === "approval" ? "approval" : "passcode";
  const email = (input?.email ?? "").trim().toLowerCase();
  const fullName = (input?.fullName ?? "").trim();
  const password = input?.password ?? "";

  if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) return fail("Enter your full name and a valid email address.");
  if (password.length < 8) return fail("Password must be at least 8 characters.");

  if (mode === "passcode") {
    const expected = process.env.ADMIN_SIGNUP_PASSCODE;
    if (!expected) return fail("Passcode signup is not configured yet. Use Request Approval.");
    if (sha256(expected).equals(Buffer.from(RETIRED_PASSCODE_SHA256, "hex"))) {
      return fail("Passcode signup is turned off until the passcode is changed. Use Request Approval.");
    }
    if (!sameSecret((input?.passcode ?? "").trim(), expected)) {
      await pause(1000); // slows down guessing
      return fail('Invalid Admin Passcode. Switch to "Request Approval" if you do not have one.');
    }
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return fail("Admin signup is not configured on the server yet.");

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone_number: (input?.phone ?? "").trim(),
      about: (input?.about ?? "").trim(),
    },
    // Only the server can write app_metadata, so a visitor cannot grant themselves this.
    app_metadata: { role: "admin", is_approved: mode === "passcode" },
  });

  if (error) {
    return fail(/already|registered|exists/i.test(error.message) ? "An account with this email already exists." : error.message);
  }
  return { ok: true, approved: mode === "passcode" };
}
