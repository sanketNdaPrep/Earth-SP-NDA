import type { User } from "@supabase/supabase-js";

export type AdminStatus = "approved" | "pending" | "none";

/**
 * Admin status lives in Supabase `app_metadata`, which only the server can
 * write. Never read it from `user_metadata`: visitors can set that themselves.
 */
export function getAdminStatus(user: User | null | undefined): AdminStatus {
  const meta = user?.app_metadata ?? {};
  if (meta.role !== "admin") return "none";
  return meta.is_approved === true ? "approved" : "pending";
}
