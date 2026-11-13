import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous client for server components that show public data (no cookies, no
 * session). Row Level Security still applies, so it only sees what a visitor may see.
 */
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
